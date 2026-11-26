import { answers, check, countRequests, decision, expect, field, heading, savedAttempt, sendAnswer, test } from './fixtures.mjs';

test('catalog search and route navigation reuse fresh GET cache entries', async ({ page, app }) => {
  const catalog = countRequests(page, 'GET', /^\/api\/courses$/);
  const exerciseReads = countRequests(page, 'GET', /^\/api\/courses\/\d+\/exercises$/);
  const python = app.tracks.PYTHON;
  await page.goto('/courses');
  const search = page.getByRole('searchbox');
  const pythonLink = page.getByRole('link', { name: 'Introduction to Python' });
  const lithuanianLink = page.getByRole('link', { name: 'Lithuanian Grammar' });
  await expect(pythonLink).toBeVisible();
  await expect(lithuanianLink).toBeVisible();
  await search.fill('  PYTHON  ');
  await expect(pythonLink).toBeVisible();
  await expect(lithuanianLink).toHaveCount(0);
  await search.fill('no matching course');
  await expect(page.getByRole('status').filter({ hasText: 'No courses match' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear search' }).click();
  await expect(search).toHaveValue('');
  await expect(search).toBeFocused();
  await expect(lithuanianLink).toBeVisible();
  expect(catalog()).toBe(1);

  await pythonLink.click();
  await page.getByRole('link', { name: `Exercise ${python.exerciseId}` }).click();
  await expect(field(page)).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(python.course);
  await expect(heading(page, 'Introduction to Python')).toBeVisible();
  await page.goBack();
  await expect(pythonLink).toBeVisible();
  await page.goForward();
  await expect(heading(page, 'Introduction to Python')).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(python.diagnostic);
  await expect(field(page)).toBeVisible();
  expect(catalog()).toBe(1);
  expect(exerciseReads()).toBe(1);
});

test('deep links, invalid IDs, and Not Found recover without writes', async ({ page, app }) => {
  const posts = countRequests(page, 'POST', /^\/api\/attempts$/);
  const patches = countRequests(page, 'PATCH', /^\/api\/recommendations\//);
  const python = app.tracks.PYTHON;
  await page.goto(python.course);
  await expect(heading(page, 'Introduction to Python')).toBeVisible();
  await page.goto(python.diagnostic + '/result');
  await expect(heading(page, 'Result unavailable')).toBeVisible();
  await page.getByRole('link', { name: 'Back to diagnostic' }).click();
  await expect(field(page)).toBeVisible();
  await page.goto('/courses/0');
  await expect(page.getByRole('alert')).toHaveText('Invalid course address.');
  await page.goto('/courses/99999');
  await expect(page.getByRole('alert')).toContainText('requested resource was not found');
  await page.goto(python.course + '/exercises/invalid');
  await expect(heading(page, 'Invalid course or exercise address')).toBeVisible();
  await page.goto(python.course + '/exercises/' + app.tracks.LITHUANIAN.exerciseId);
  await expect(page.getByRole('alert')).toHaveText('This exercise is unavailable for this course.');
  await page.goto('/unknown-page');
  await expect(heading(page, 'Page not found')).toBeVisible();
  await page.getByRole('link', { name: 'Back to courses' }).click();
  await expect(page).toHaveURL('/courses');
  expect(posts()).toBe(0);
  expect(patches()).toBe(0);
});

test('refresh expires in-memory result and recovers without replaying writes', async ({ page, app }) => {
  const posts = countRequests(page, 'POST', /^\/api\/attempts$/);
  const patches = countRequests(page, 'PATCH', /^\/api\/recommendations\//);
  const python = app.tracks.PYTHON;
  await page.goto(python.diagnostic);
  const result = await sendAnswer(page, answers.pythonMisconception.value.submitted_answer, 201);
  await decision(page, 'Accept').click();
  await expect(page.getByRole('status').filter({ hasText: 'Saved decision' })).toHaveText('Saved decision · Accepted');
  await page.reload();
  await expect(heading(page, 'Result unavailable')).toBeVisible();
  await page.getByRole('link', { name: 'Back to diagnostic' }).click();
  await expect(field(page)).toHaveValue('');
  await expect(check(page)).toBeEnabled();
  expect(posts()).toBe(1);
  expect(patches()).toBe(1);
  expect((await app.db.query('SELECT attempt_id FROM attempts')).rowCount).toBe(1);
  expect(await savedAttempt(app.db, result.attempt_id)).toMatchObject({ learner_decision: 'accepted' });
});

test('delayed exercise read populates only its original course cache', async ({ page, app }) => {
  const python = app.tracks.PYTHON;
  const lithuanian = app.tracks.LITHUANIAN;
  const pythonRead = '/api' + python.course + '/exercises';
  const release = Promise.withResolvers();
  const arrived = Promise.withResolvers();
  const exerciseReads = countRequests(page, 'GET', /^\/api\/courses\/\d+\/exercises$/);
  await page.route('**' + pythonRead, async route => {
    arrived.resolve();
    await release.promise;
    await route.continue();
  }, { times: 1 });

  const response = page.waitForResponse(res => new URL(res.url()).pathname === pythonRead);
  try {
    await page.goto(python.diagnostic);
    await expect(page.getByRole('status').filter({ hasText: 'Loading exercise' })).toBeVisible();
    await arrived.promise;
    await page.getByRole('link', { name: 'Courses', exact: true }).click();
    await page.getByRole('link', { name: 'Lithuanian Grammar' }).click();
    await page.getByRole('link', { name: `Exercise ${lithuanian.exerciseId}` }).click();
    await field(page).fill('Lithuanian draft');
  } finally {
    release.resolve();
  }
  expect((await response).status()).toBe(200);
  await expect(page).toHaveURL(lithuanian.diagnostic);
  await expect(field(page)).toHaveValue('Lithuanian draft');
  await page.getByRole('link', { name: 'Courses', exact: true }).click();
  await page.getByRole('link', { name: 'Introduction to Python' }).click();
  await page.getByRole('link', { name: `Exercise ${python.exerciseId}` }).click();
  await expect(field(page)).toHaveValue('');
  expect(exerciseReads()).toBe(2);
});
