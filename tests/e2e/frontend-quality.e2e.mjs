import AxeBuilder from '@axe-core/playwright'
import { answers, check, decision, expect, field, heading, sendAnswer, test } from './fixtures.mjs'

const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
const themeButton = (page) => page.getByRole('button', { name: 'Dark theme' })
const python = (page) => page.getByRole('link', { name: 'Introduction to Python', exact: true })
const wrong = answers.pythonMisconception.value.submitted_answer

for (const colorScheme of ['light', 'dark']) {
  test.describe(`${colorScheme} theme`, () => {
    test.use({ colorScheme })

    test('axe checks learner states and captures catalog and result', async ({ page, app }, info) => {
      const audits = []
      async function audit(state) {
        const { violations } = await new AxeBuilder({ page }).withTags(tags).analyze()
        audits.push({ state, violations })
      }

      const catalog = '**/api/courses'
      let release
      const gate = new Promise((resolve) => {
        release = resolve
      })
      await page.route(
        catalog,
        async (route) => {
          await gate
          await route.fulfill({ status: 500, json: { status: 'error' } })
        },
        { times: 1 },
      )

      try {
        await page.goto('/courses')
        await expect(page.getByText('Loading courses…', { exact: true })).toBeVisible()
        await audit('catalog loading')
      } finally {
        release()
      }
      await expect(page.getByRole('alert')).toBeVisible()
      await audit('catalog read failure')
      await page.getByRole('button', { name: 'Retry loading' }).click()
      await expect(python(page)).toBeVisible()
      await expect(themeButton(page)).toHaveAttribute('aria-pressed', String(colorScheme === 'dark'))
      await audit('catalog')
      await page.screenshot({ path: info.outputPath(`fe05-${colorScheme}-catalog.png`), fullPage: true })

      await python(page).click()
      await expect(heading(page, 'Introduction to Python')).toBeVisible()
      await audit('course details')
      const track = app.tracks.PYTHON
      await page.getByRole('link', { name: `Exercise ${track.exerciseId}` }).click()
      await expect(field(page)).toBeVisible()
      await audit('diagnostic form')
      await check(page).click()
      await expect(field(page)).toHaveAccessibleDescription(/Enter an answer before submitting/)
      await audit('form validation')
      await sendAnswer(page, wrong, 201)
      await expect(heading(page, 'Incorrect answer')).toBeFocused()
      await audit('assessment and recommendation actions')
      await page.screenshot({ path: info.outputPath(`fe05-${colorScheme}-result.png`), fullPage: true })
      await decision(page, 'Accept').click()
      await expect(page.getByRole('status')).toHaveText('Saved decision · Accepted')
      await audit('saved recommendation decision')

      await info.attach('axe-results', { contentType: 'application/json', body: JSON.stringify(audits) })
      const violations = audits.flatMap(({ state, violations }) =>
        violations.map(({ id, nodes }) => ({ state, id, targets: nodes.map(({ target }) => target) })),
      )
      expect(violations).toEqual([])
    })
  })
}

test('theme follows the system until a keyboard choice persists across loads', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/courses')
  const toggle = themeButton(page)
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('html')).not.toHaveAttribute('data-theme')
  await page.emulateMedia({ colorScheme: 'light' })
  await expect(toggle).toHaveAttribute('aria-pressed', 'false')
  await toggle.focus()
  await page.keyboard.press('Space')
  await expect(toggle).toBeFocused()
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark')
  await page.reload()
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  expect(await page.evaluate(() => Object.entries(localStorage))).toEqual([
    ['learning-assistant-theme', 'dark'],
  ])
})

test('theme control still works when storage access throws', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('Blocked', 'SecurityError')
      },
    })
  })
  await page.goto('/courses')
  await expect(themeButton(page)).toHaveAttribute('aria-pressed', 'false')
  await themeButton(page).click()
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark')
  await page.reload()
  await expect(themeButton(page)).toHaveAttribute('aria-pressed', 'false')
})

test('keyboard can skip the header, open a course and recover from invalid input', async ({ page, app }) => {
  await page.goto('/courses')
  await expect(python(page)).toBeVisible()
  const skip = page.getByRole('link', { name: 'Skip to content' })
  await page.keyboard.press('Tab')
  await expect(skip).toBeFocused()
  expect(await skip.evaluate((el) => el.getBoundingClientRect().top)).toBeGreaterThanOrEqual(0)
  await page.keyboard.press('Enter')
  const main = page.getByRole('main')
  await expect(main).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('searchbox')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(python(page)).toBeFocused()
  expect(await python(page).evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid')
  await page.keyboard.press('Enter')
  await expect(main).toBeFocused()
  await expect(heading(page, 'Introduction to Python')).toBeVisible()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Back to courses' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: `Exercise ${app.tracks.PYTHON.exerciseId}` })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(main).toBeFocused()
  await expect(field(page)).toBeVisible()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await expect(field(page)).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(check(page)).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(field(page)).toBeFocused()
  await expect(field(page)).toHaveAccessibleDescription(/Enter an answer before submitting/)
  await sendAnswer(page, wrong, 201)
  await expect(heading(page, 'Incorrect answer')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(decision(page, 'Accept')).toBeFocused()
  await page.keyboard.press('Enter')
  const recommendation = page.getByRole('region', { name: 'Recommended next topic' })
  await expect(recommendation.getByRole('status')).toHaveText('Saved decision · Accepted')
  await expect(recommendation).toBeFocused()
})

for (const colorScheme of ['light', 'dark']) {
  test(`learner pages reflow at five widths and with enlarged text in ${colorScheme}`, async ({
    page,
    app,
  }) => {
    await page.emulateMedia({ colorScheme })
    await page.goto('/courses')
    await expect(python(page)).toBeVisible()
    async function checkWidths() {
      for (const width of [320, 375, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 })
        const scroll = await page.evaluate(() => document.documentElement.scrollWidth)
        expect(scroll, `page width at viewport ${width}`).toBeLessThanOrEqual(width)
      }
      await page.setViewportSize({ width: 320, height: 900 })
      const enlarged = await page.addStyleTag({ content: 'html { font-size: 200%; }' })
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
      await enlarged.evaluate((style) => style.remove())
    }

    await checkWidths()
    await python(page).click()
    await expect(heading(page, 'Introduction to Python')).toBeVisible()
    await checkWidths()
    await page.goto(app.tracks.PYTHON.diagnostic)
    await expect(field(page)).toBeVisible()
    await checkWidths()
    await sendAnswer(page, wrong, 201)
    await expect(decision(page, 'Accept')).toBeVisible()
    await checkWidths()
    await page.setViewportSize({ width: 320, height: 900 })
    await page.addStyleTag({ content: 'html { font-size: 200%; }' })
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
    for (const action of ['Accept', 'Reject']) {
      const button = decision(page, action)
      await button.scrollIntoViewIfNeeded()
      await expect(button).toBeInViewport()
      const box = await button.boundingBox()
      expect(box.width).toBeGreaterThanOrEqual(24)
      expect(box.height).toBeGreaterThanOrEqual(24)
    }
  })
}

for (const colorScheme of ['light', 'dark']) {
  test(`enabled controls respect hover capability and motion preference in ${colorScheme}`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme, reducedMotion: 'no-preference' })
    await page.goto('/courses')
    await expect(python(page)).toBeVisible()
    const toggle = themeButton(page)
    const canHover = await page.evaluate(() => matchMedia('(hover: hover)').matches)
    await expect(toggle).toHaveCSS('transition-duration', canHover ? '0.12s' : '0s')
    if (canHover) {
      await expect(toggle).toHaveCSS('transition-property', 'box-shadow')
    }
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await expect(toggle).toHaveCSS('transition-duration', '0s')
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await expect(toggle).toBeFocused()
    await expect(toggle).toHaveCSS('outline-style', 'solid')
    await expect(toggle).toHaveCSS('outline-width', '3px')
    await page.keyboard.press('Space')
    await expect(toggle).toBeFocused()
    await expect(toggle).toHaveAttribute('aria-pressed', String(colorScheme === 'light'))
  })
}
