import { answers, check, countRequests, decision, expect, field, heading, savedAttempt, sendAnswer, test } from './fixtures.mjs';

for (const [code, name, prefix, topic, action, outcome] of [
  ['PYTHON', 'Introduction to Python', 'python', 'Type Conversion', 'Accept', 'accepted'],
  ['LITHUANIAN', 'Lithuanian Grammar', 'lithuanian', 'Accusative Case', 'Reject', 'rejected'],
]) {
  test(`${code} learner journey: select, revise, save a decision, and try again`, async ({ page, app }) => {
    const track = app.tracks[code];
    const posts = countRequests(page, 'POST', /^\/api\/attempts$/);
    await page.goto('/');
    await expect(page).toHaveURL('/courses');
    await page.getByRole('link', { name, exact: true }).click();
    await expect(heading(page, name)).toBeVisible();
    await expect(heading(page, 'Topics')).toBeVisible();
    await page.getByRole('link', { name: `Exercise ${track.exerciseId}` }).click();
    await expect(page).toHaveURL(track.diagnostic);
    await expect(heading(page, 'Diagnostic exercise')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize().width);

    await field(page).fill('   ');
    await check(page).click();
    await expect(page.getByRole('alert')).toHaveText('Enter an answer before submitting.');
    await expect(field(page)).toBeFocused();
    await expect(field(page)).toHaveAttribute('aria-invalid', 'true');
    expect(posts()).toBe(0);

    const uncertain = 'I am unsure what this means.';
    await sendAnswer(page, uncertain, 422);
    await expect(heading(page, 'Answer needs clarification')).toBeVisible();
    await expect(field(page)).toHaveValue(uncertain);
    expect((await app.db.query('SELECT attempt_id FROM attempts')).rowCount).toBe(0);

    const wrong = answers[prefix + 'Misconception'].value.submitted_answer;
    const result = await sendAnswer(page, wrong, 201);
    await expect(page).toHaveURL(track.diagnostic + '/result');
    await expect(heading(page, 'Incorrect answer')).toBeVisible();
    await expect(page.getByRole('definition')).toHaveText(result.error_category_id);
    const recommendation = page.getByRole('region', { name: 'Recommended next topic' });
    await expect(recommendation.getByText(topic, { exact: true })).toBeVisible();
    expect(result.recommendation.explanation).toBeTruthy();
    await expect(recommendation.getByText(result.recommendation.explanation, { exact: true })).toBeVisible();
    const before = await savedAttempt(app.db, result.attempt_id);
    expect(before).toMatchObject({
      exercise_id: track.exerciseId, submitted_answer: wrong, is_correct: false,
      error_category_id: result.error_category_id, learner_decision: 'pending',
      explanation: result.recommendation.explanation,
    });
    await decision(page, action).click();
    await expect(recommendation.getByRole('status')).toHaveText('Saved decision · ' + action + 'ed');
    expect(await savedAttempt(app.db, result.attempt_id)).toEqual({ ...before, learner_decision: outcome });

    await page.getByRole('link', { name: 'Back to diagnostic' }).click();
    await expect(field(page)).toHaveValue('');
    const correct = answers[prefix + 'Correct'].value.submitted_answer;
    const revision = await sendAnswer(page, correct, 201);
    await expect(heading(page, 'Correct answer')).toBeVisible();
    await expect(recommendation).toHaveCount(0);
    expect(revision.attempt_id).not.toBe(result.attempt_id);
    expect(await savedAttempt(app.db, revision.attempt_id)).toMatchObject({
      exercise_id: track.exerciseId, submitted_answer: correct, is_correct: true, recommendation_id: null,
    });
    expect(posts()).toBe(3);
    expect((await app.db.query('SELECT attempt_id FROM attempts')).rowCount).toBe(2);
  });
}
