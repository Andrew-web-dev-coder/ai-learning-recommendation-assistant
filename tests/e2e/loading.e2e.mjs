import { expect, heading, test } from './fixtures.mjs';

test('cold course reads show loading and refresh keeps confirmed details visible', async ({ page, app }) => {
  const { course, exerciseId } = app.tracks.PYTHON;
  const details = url => url.pathname === `/api${course}/topics` ||
    url.pathname === `/api${course}/exercises`;
  const cold = Promise.withResolvers();
  await page.route(details, async route => {
    await cold.promise;
    await route.continue();
  });
  const loading = page.getByRole('status').filter({ hasText: 'Loading course…' });
  const exercise = page.getByRole('link', { name: `Exercise ${exerciseId}` });
  try {
    await page.goto(course);
    await expect(loading).toBeVisible();
    await expect(exercise).toHaveCount(0);
    await expect(heading(page, 'Topics')).toHaveCount(0);
    await expect(page.getByText(/No topics|No active exercises/)).toHaveCount(0);
    await expect(page.getByRole('alert')).toHaveCount(0);
  } finally {
    cold.resolve();
  }
  await expect(heading(page, 'Introduction to Python')).toBeVisible();
  await expect(heading(page, 'Topics')).toBeVisible();
  await expect(exercise).toBeVisible();
  await expect(loading).toHaveCount(0);

  await page.unroute(details);
  const refresh = Promise.withResolvers();
  await page.route(details, async route => {
    await refresh.promise;
    await route.continue();
  });
  const refreshing = page.getByRole('status').filter({ hasText: 'Refreshing…' });
  const refreshButton = page.getByRole('button', { name: 'Refresh', exact: true });
  try {
    await refreshButton.click();
    await expect(refreshing).toBeVisible();
    await expect(refreshButton).toBeDisabled();
    await expect(exercise).toBeVisible();
    await expect(page.getByText(/No topics|No active exercises/)).toHaveCount(0);
  } finally {
    refresh.resolve();
  }
  await expect(refreshing).toHaveCount(0);
  await expect(refreshButton).toBeEnabled();
  await expect(exercise).toBeVisible();
});

for (const entry of ['direct URL', 'catalog navigation']) {
  test(`cold course route chunk shows page loading during ${entry}`, async ({ page, app }) => {
    const { course, exerciseId } = app.tracks.PYTHON;
    const chunk = /\/assets\/CoursePage-[^/]+\.js$/;
    const requested = Promise.withResolvers();
    const release = Promise.withResolvers();
    await page.route(chunk, async route => {
      requested.resolve();
      await release.promise;
      await route.continue();
    }, { times: 1 });

    const loading = page.getByRole('status').filter({ hasText: 'Loading page…' });
    const exercise = page.getByRole('link', { name: `Exercise ${exerciseId}` });
    try {
      if (entry === 'direct URL') {
        await page.goto(course, { waitUntil: 'domcontentloaded' });
      } else {
        await page.goto('/courses');
        await page.getByRole('link', { name: 'Introduction to Python' }).click();
      }
      await requested.promise;
      await expect(loading).toBeVisible();
      await expect(exercise).toHaveCount(0);
      await expect(page.getByRole('alert')).toHaveCount(0);
      await expect(page.getByText(/No topics|No active exercises/)).toHaveCount(0);
    } finally {
      release.resolve();
    }
    await expect(page).toHaveURL(course);
    await expect(heading(page, 'Introduction to Python')).toBeVisible();
    await expect(exercise).toBeVisible();
    await expect(loading).toHaveCount(0);
  });
}
