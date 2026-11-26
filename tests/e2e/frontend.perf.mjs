import { readFile, readdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { answers, check, decision, expect, field, heading, test } from './fixtures.mjs';

async function bundleSizes() {
  const directory = new URL('../../dist/assets/', import.meta.url);
  const sizes = { js: { raw: 0, gzip: 0 }, css: { raw: 0, gzip: 0 } };
  for (const name of await readdir(directory)) {
    const kind = name.split('.').at(-1);
    if (kind !== 'js' && kind !== 'css') continue;
    const contents = await readFile(new URL(name, directory));
    sizes[kind].raw += contents.length;
    sizes[kind].gzip += gzipSync(contents).length;
  }
  return sizes;
}

test('desktop cold catalog, diagnostic and warm cache', async ({ page, app, browser }, testInfo) => {
  const latencyMs = Number(process.env.PERF_LATENCY_MS ?? 0);
  if (latencyMs > 0) {
    const session = await page.context().newCDPSession(page);
    await session.send('Network.enable');
    await session.send('Network.emulateNetworkConditions', {
      offline: false, latency: latencyMs, downloadThroughput: -1, uploadThroughput: -1,
    });
  }
  const requests = [];
  page.on('request', request => {
    const url = new URL(request.url());
    if (url.origin === app.url) requests.push({ method: request.method(), path: url.pathname });
  });

  await page.addInitScript(() => {
    window.perf = { lcp: null, action: null };
    new PerformanceObserver(list => {
      window.perf.lcp = list.getEntries().at(-1).startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    document.addEventListener('click', () => {
      window.perf.action = performance.now();
    }, { capture: true });
  });

  const courseLink = page.getByRole('link', { name: 'Introduction to Python', exact: true });
  await page.goto('/');
  await courseLink.waitFor();
  const cold = await page.evaluate(async () => {
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const navigation = performance.getEntriesByType('navigation')[0];
    const assets = performance.getEntriesByType('resource');
    const js = assets.filter(entry => new URL(entry.name).pathname.endsWith('.js'));
    const css = assets.filter(entry => new URL(entry.name).pathname.endsWith('.css'));
    const bytes = entries => entries.reduce((total, entry) => total + entry.decodedBodySize, 0);
    return {
      catalogReadyMs: performance.now(),
      lcpMs: window.perf.lcp,
      documentResponseMs: navigation.responseStart,
      jsBytes: bytes(js),
      cssBytes: bytes(css),
    };
  });

  async function clickToVisible(control, target) {
    const offset = requests.length;
    await control.click();
    await target.waitFor();
    // The next animation frame is a consistent DOM-to-frame checkpoint.
    const ms = await page.evaluate(async () => {
      await new Promise(resolve => requestAnimationFrame(resolve));
      return performance.now() - window.perf.action;
    });
    return { ms, requests: requests.slice(offset).length };
  }

  cold.requests = requests.length;
  const exerciseLink = page.getByRole('link', { name: `Exercise ${app.tracks.PYTHON.exerciseId}` });
  const course = await clickToVisible(courseLink, exerciseLink);
  const diagnostic = await clickToVisible(exerciseLink, field(page));
  await field(page).fill(answers.pythonMisconception.value.submitted_answer);
  const recommendation = page.getByRole('region', { name: 'Recommended next topic' });
  const response = page.waitForResponse(res => res.url().endsWith('/api/attempts') && res.request().method() === 'POST');
  const submission = await clickToVisible(check(page), recommendation);
  expect((await response).status()).toBe(201);
  const resultStarts = await page.evaluate(() => {
    const entries = performance.getEntriesByType('resource');
    const post = entries.find(entry => new URL(entry.name).pathname === '/api/attempts');
    const result = entries.find(entry => /\/ResultPage-[^/]+\.js$/.test(new URL(entry.name).pathname));
    return result && post ? {
      chunkStartAfterPostStartMs: result.startTime - post.startTime,
      chunkStartAfterPostEndMs: result.startTime - post.responseEnd,
    } : null;
  });

  await decision(page, 'Accept').click();
  await expect(recommendation.getByRole('status')).toHaveText('Saved decision · Accepted');
  const warm = await clickToVisible(page.getByRole('link', { name: 'Courses', exact: true }), courseLink);
  await clickToVisible(courseLink, exerciseLink);
  await clickToVisible(exerciseLink, heading(page, 'Diagnostic exercise'));
  await expect(field(page)).toBeVisible();

  const api = requests.filter(request => request.path.startsWith('/api/'));
  const counts = Object.fromEntries(['GET', 'POST', 'PATCH'].map(method => [
    method, api.filter(request => request.method === method).length,
  ]));
  expect(counts).toEqual({ GET: 3, POST: 1, PATCH: 1 });
  expect(warm.requests).toBe(0);

  const bundles = await bundleSizes();
  if (process.env.PERF_ENFORCE_BUDGETS === '1') {
    expect(cold.jsBytes).toBeLessThanOrEqual(425_000);
    expect(cold.cssBytes).toBeLessThanOrEqual(8_000);
    expect(bundles.js.gzip).toBeLessThanOrEqual(140_000);
    expect(bundles.css.gzip).toBeLessThanOrEqual(2_300);
    expect(resultStarts).not.toBeNull();
    if (latencyMs > 0) expect(resultStarts.chunkStartAfterPostEndMs).toBeLessThan(0);
  }

  console.log('PERF ' + JSON.stringify({
    repetition: testInfo.repeatEachIndex, latencyMs, chromium: browser.version(),
    cold, course, diagnostic, submission, resultStarts, warm, counts, bundles,
  }));
});
