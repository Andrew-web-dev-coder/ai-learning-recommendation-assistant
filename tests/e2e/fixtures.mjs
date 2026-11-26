import { expect, test as base } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { preview } from 'vite';
import { startContractEnvironment } from '../contract-environment.mjs';

const contract = JSON.parse(await readFile(new URL('../../docs/api/openapi.json', import.meta.url), 'utf8'));
export const answers = contract.paths['/api/attempts'].post.requestBody.content['application/json'].examples;

export const test = base.extend({
  // Start one application and one newly migrated database per test.
  app: async ({}, use) => {
    const cleanup = [];
    try {
      const { db, origin } = await startContractEnvironment({ after: fn => cleanup.push(fn) });
      const frontend = await preview({
        preview: { host: '127.0.0.1', port: 0, strictPort: true, proxy: { '/api': origin } },
      });
      cleanup.push(() => new Promise((resolve, reject) => {
        frontend.httpServer.close(error => error ? reject(error) : resolve());
      }));
      const { rows } = await db.query(
        'SELECT course_code, course_id, exercise_id FROM courses JOIN topics USING (course_id) JOIN exercises USING (topic_id) WHERE exercises.is_active',
      );
      const tracks = Object.fromEntries(rows.map(row => [row.course_code, {
        course: `/courses/${row.course_id}`,
        diagnostic: `/courses/${row.course_id}/exercises/${row.exercise_id}`,
        exerciseId: row.exercise_id,
      }]));
      await use({ db, origin, tracks, url: `http://127.0.0.1:${frontend.httpServer.address().port}` });
    } finally {
      try {
        await cleanup[1]?.();
      } finally {
        await cleanup[0]?.();
      }
    }
  },
  baseURL: async ({ app }, use) => {
    await use(app.url);
  },
});

export { expect };

export const field = page => page.getByRole('textbox', { name: /Your answer/ });
export const check = page => page.getByRole('button', { name: 'Check my answer' });
export const decision = (page, action) => page.getByRole('button', { name: action + ' recommendation' });
export const heading = (page, name) => page.getByRole('heading', { name, exact: true });
export const attempts = '**/api/attempts';
export const decisions = '**/api/recommendations/*/decision';

export function countRequests(page, method, path) {
  let count = 0;
  page.on('request', request => {
    if (request.method() === method && path.test(new URL(request.url()).pathname)) {
      count++;
    }
  });
  return () => count;
}

export async function sendAnswer(page, answer, status) {
  await field(page).fill(answer);
  const response = page.waitForResponse(res => res.url().endsWith('/api/attempts') && res.request().method() === 'POST');
  await check(page).click();
  const result = await response;
  expect(result.status()).toBe(status);
  return result.json();
}

export async function savedAttempt(db, id) {
  const { rows } = await db.query(
    `SELECT a.exercise_id, a.submitted_answer, a.is_correct, a.error_category_id,
            r.recommendation_id, r.learner_decision, r.explanation
     FROM attempts a LEFT JOIN recommendations r USING (attempt_id)
     WHERE a.attempt_id = $1`, [id],
  );
  expect(rows).toHaveLength(1);
  return rows[0];
}
