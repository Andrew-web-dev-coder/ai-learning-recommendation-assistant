import { answers, attempts, check, countRequests, decision, decisions, expect, field, heading, savedAttempt, sendAnswer, test } from './fixtures.mjs';

const catalogPath = '**/api/courses';
const pythonWrong = answers.pythonMisconception.value.submitted_answer;
const lithuanianCorrect = answers.lithuanianCorrect.value.submitted_answer;

test('injected catalog failure shows loading, then recovers via explicit retry', async ({ page }) => {
  const release = Promise.withResolvers();
  const gets = countRequests(page, 'GET', /^\/api\/courses$/);
  await page.route(catalogPath, async route => {
    await release.promise;
    await route.fulfill({ status: 500, contentType: 'application/json', json: { status: 'error', message: 'Fixture failure' } });
  }, { times: 1 });
  try {
    await page.goto('/courses');
    await expect(page.getByRole('status').filter({ hasText: 'Loading courses' })).toBeVisible();
    await expect(page.getByRole('searchbox')).toHaveCount(0);
  } finally {
    release.resolve();
  }
  await expect(page.getByRole('alert')).toHaveText('The service encountered an error.');
  expect(gets()).toBe(1);
  const retry = Promise.withResolvers();
  await page.route(catalogPath, async route => {
    await retry.promise;
    await route.continue();
  }, { times: 1 });
  const retryControl = page.getByRole('button', { name: /^(?:Retry loading|Refresh)$/ });
  const refreshing = page.getByRole('status').filter({ hasText: 'Refreshing…' });
  try {
    await page.getByRole('button', { name: 'Retry loading' }).click();
    await expect(refreshing).toBeVisible();
    await expect(retryControl).toBeDisabled();
    await expect(page.getByRole('searchbox')).toHaveCount(0);
  } finally {
    retry.resolve();
  }
  await expect(page.getByRole('link', { name: 'Introduction to Python' })).toBeVisible();
  await expect(refreshing).toHaveCount(0);
  expect(gets()).toBe(2);
});

test('injected diagnostic rejection preserves the draft and permits manual correction', async ({ page, app }) => {
  await page.route(attempts, route => route.fulfill({
    status: 400, contentType: 'application/json', json: { status: 'error', message: 'Fixture rejection' },
  }), { times: 1 });
  const posts = countRequests(page, 'POST', /^\/api\/attempts$/);
  await page.goto(app.tracks.PYTHON.diagnostic);
  await sendAnswer(page, pythonWrong, 400);
  await expect(page.getByRole('alert')).toHaveText('The service rejected the request. Check your input.');
  await expect(field(page)).toHaveValue(pythonWrong);
  await expect(check(page)).toBeEnabled();
  expect(posts()).toBe(1);
  expect((await app.db.query('SELECT attempt_id FROM attempts')).rowCount).toBe(0);
  await sendAnswer(page, answers.pythonCorrect.value.submitted_answer, 201);
  await expect(heading(page, 'Correct answer')).toBeVisible();
  expect(posts()).toBe(2);
});

for (const [status, message] of [
  [401, 'The service requires authentication for this request. Return to Courses or contact the demo maintainer.'],
  [403, 'The service does not permit this request. Return to Courses and choose another exercise.'],
]) {
  test(`injected HTTP ${status} denies assessment safely and allows recovery`, async ({ page, app }) => {
    const syntheticAnswer = `Synthetic diagnostic submission for HTTP ${status}.`;
    const privateDetail = 'Synthetic private transport response detail';
    const consoleMessages = [];
    page.on('console', entry => consoleMessages.push(entry.text()));
    await page.route(attempts, route => route.fulfill({
      status,
      json: { status: 'error', message: privateDetail, submitted_answer: syntheticAnswer },
    }), { times: 1 });

    const posts = countRequests(page, 'POST', /^\/api\/attempts$/);
    const { diagnostic } = app.tracks.PYTHON;
    await page.goto(diagnostic);
    await sendAnswer(page, syntheticAnswer, status);
    await expect(page.getByRole('alert')).toHaveText(message);
    await expect(field(page)).toHaveValue(syntheticAnswer);
    await expect(check(page)).toBeEnabled();
    await expect(page).toHaveURL(diagnostic);
    await expect(page.getByRole('heading', { name: /^(?:Correct answer|Incorrect answer|Recommended next topic)$/ })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /View this session/ })).toHaveCount(0);
    expect(posts()).toBe(1);
    expect((await app.db.query('SELECT attempt_id FROM attempts')).rowCount).toBe(0);

    await page.getByRole('link', { name: 'Courses', exact: true }).click();
    await page.getByRole('link', { name: 'Introduction to Python' }).click();
    await page.getByRole('link', { name: `Exercise ${app.tracks.PYTHON.exerciseId}` }).click();
    await sendAnswer(page, answers.pythonCorrect.value.submitted_answer, 201);
    await expect(heading(page, 'Correct answer')).toBeVisible();
    expect(posts()).toBe(2);
    expect(consoleMessages.join('\n')).not.toContain(syntheticAnswer);
    expect(consoleMessages.join('\n')).not.toContain(privateDetail);
  });
}

test('delayed POST stays in its original route scope and blocks duplicate submits', async ({ page, app }) => {
  const release = Promise.withResolvers();
  const posts = countRequests(page, 'POST', /^\/api\/attempts$/);
  const python = app.tracks.PYTHON;
  const lithuanian = app.tracks.LITHUANIAN;
  await page.route(attempts, async route => {
    await release.promise;
    await route.continue();
  }, { times: 1 });
  await page.goto(python.diagnostic);
  await field(page).fill(pythonWrong);
  const response = page.waitForResponse(res => res.url().endsWith('/api/attempts') && res.status() === 201);
  try {
    await check(page).click();
    const checking = page.getByRole('button', { name: 'Checking…' });
    await expect(checking).toBeDisabled();
    await expect(field(page)).toBeDisabled();
    await expect(page.getByRole('status').filter({ hasText: 'Checking your answer' })).toBeVisible();
    await field(page).evaluate(input => input.form.requestSubmit());
    await expect.poll(posts).toBe(1);
    await page.getByRole('link', { name: 'Back to course', exact: true }).click();
    await page.getByRole('link', { name: 'Back to courses', exact: true }).click();
    await page.getByRole('link', { name: 'Lithuanian Grammar' }).click();
    await page.getByRole('link', { name: `Exercise ${lithuanian.exerciseId}` }).click();
    await field(page).fill(lithuanianCorrect);
  } finally {
    release.resolve();
  }
  const { attempt_id } = await (await response).json();
  expect(await savedAttempt(app.db, attempt_id)).toMatchObject({ exercise_id: python.exerciseId });
  await expect(page).toHaveURL(lithuanian.diagnostic);
  await expect(field(page)).toHaveValue(lithuanianCorrect);
  await expect(page.getByRole('link', { name: /View this session/ })).toHaveCount(0);
  expect(posts()).toBe(1);
  await sendAnswer(page, lithuanianCorrect, 201);
  await expect(heading(page, 'Correct answer')).toBeVisible();
  await expect(page).toHaveURL(lithuanian.diagnostic + '/result');
  await page.getByRole('link', { name: 'Courses', exact: true }).click();
  await page.getByRole('link', { name: 'Introduction to Python' }).click();
  await page.getByRole('link', { name: `Exercise ${python.exerciseId}` }).click();
  await expect(page).toHaveURL(python.diagnostic);
  await page.getByRole('link', { name: /View this session/ }).click();
  await expect(heading(page, 'Incorrect answer')).toBeVisible();
  expect(posts()).toBe(2);
});

test('real PATCH conflict leaves the competing decision intact and closes controls', async ({ page, app }) => {
  const patches = countRequests(page, 'PATCH', /^\/api\/recommendations\//);
  await page.goto(app.tracks.PYTHON.diagnostic);
  const result = await sendAnswer(page, pythonWrong, 201);
  const path = '/api/recommendations/' + result.recommendation.recommendation_id + '/decision';
  const winner = await fetch(app.origin + path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision: 'rejected' }),
  });
  expect(winner.status).toBe(200);
  const conflict = page.waitForResponse(res => res.url().endsWith(path) && res.request().method() === 'PATCH');
  await decision(page, 'Accept').click();
  expect((await conflict).status()).toBe(409);
  await expect(page.getByRole('alert')).toContainText('A decision was already recorded');
  await expect(page.getByText(/Saved decision/)).toHaveCount(0);
  await expect(decision(page, 'Accept')).toHaveCount(0);
  await expect(decision(page, 'Reject')).toHaveCount(0);
  expect(await savedAttempt(app.db, result.attempt_id)).toMatchObject({ learner_decision: 'rejected' });
  expect(patches()).toBe(1);
});

test('committed POST with a dropped response pauses submission without replay', async ({ page, app }) => {
  const committed = Promise.withResolvers();
  const posts = countRequests(page, 'POST', /^\/api\/attempts$/);
  await page.route(attempts, async route => {
    const upstream = await route.fetch({ maxRetries: 0, maxRedirects: 0 });
    committed.resolve({ status: upstream.status(), body: await upstream.json() });
    await route.abort('connectionreset');
  }, { times: 1 });
  await page.goto(app.tracks.PYTHON.diagnostic);
  await field(page).fill(pythonWrong);
  await check(page).click();
  await expect(page.getByRole('alert')).toContainText('could not confirm whether this answer was saved');
  const { status, body } = await committed.promise;
  expect(status).toBe(201);
  expect(await savedAttempt(app.db, body.attempt_id)).toMatchObject({
    submitted_answer: pythonWrong, learner_decision: 'pending',
  });
  await expect(field(page)).toHaveValue(pythonWrong);
  await field(page).fill('A revised draft');
  await expect(check(page)).toBeDisabled();
  await page.getByRole('link', { name: 'Back to course', exact: true }).click();
  await page.getByRole('link', { name: `Exercise ${app.tracks.PYTHON.exerciseId}` }).click();
  await expect(check(page)).toBeDisabled();
  expect(posts()).toBe(1);
  expect((await app.db.query('SELECT attempt_id FROM attempts')).rowCount).toBe(1);
});

test('committed PATCH with a dropped response blocks duplicates and closes decision controls', async ({ page, app }) => {
  const release = Promise.withResolvers();
  const committed = Promise.withResolvers();
  const patches = countRequests(page, 'PATCH', /^\/api\/recommendations\//);
  await page.route(decisions, async route => {
    await release.promise;
    const upstream = await route.fetch({ maxRetries: 0, maxRedirects: 0 });
    committed.resolve(upstream.status());
    await route.abort('connectionreset');
  }, { times: 1 });
  await page.goto(app.tracks.PYTHON.diagnostic);
  const result = await sendAnswer(page, pythonWrong, 201);
  try {
    await decision(page, 'Accept').click();
    await expect(page.getByRole('status').filter({ hasText: 'Saving your recommendation decision' })).toBeVisible();
    await expect(decision(page, 'Accept')).toBeDisabled();
    await expect(decision(page, 'Reject')).toBeDisabled();
    await decision(page, 'Reject').dispatchEvent('click');
    await expect.poll(patches).toBe(1);
  } finally {
    release.resolve();
  }
  await expect(page.getByRole('alert')).toContainText('could not confirm whether the decision was saved');
  expect(await committed.promise).toBe(200);
  await expect(decision(page, 'Accept')).toHaveCount(0);
  await expect(decision(page, 'Reject')).toHaveCount(0);
  await expect(page.getByText(/Saved decision/)).toHaveCount(0);
  expect(await savedAttempt(app.db, result.attempt_id)).toMatchObject({ learner_decision: 'accepted' });
  expect(patches()).toBe(1);
});
