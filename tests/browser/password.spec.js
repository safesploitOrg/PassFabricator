import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function readGenerated(page) {
  await expect(page.locator('#password')).not.toHaveValue('');
  await expect(page.locator('#loading-spinner')).toBeHidden();
  return {
    password: await page.locator('#password').inputValue(),
    bits: await page.locator('#entropyValue').textContent(),
    strength: await page.locator('#strength').getAttribute('value')
  };
}

async function assertRoundTrip(page) {
  const GENERATED = await readGenerated(page);
  await page.getByRole('button', { name: 'Analyse', exact: true }).click();
  await page.locator('#analysisPassword').fill(GENERATED.password);
  await expect(page.locator('#entropyValue')).toHaveText(GENERATED.bits);
  await expect(page.locator('#strength')).toHaveAttribute('value', GENERATED.strength);
  return GENERATED;
}

test('random password shows identical entropy after pasting into Analyse', async ({ page }) => {
  // Repeats force penalties and make the old Generate/Analyse mismatch deterministic.
  await page.addInitScript(() => {
    Object.defineProperty(globalThis.crypto, 'getRandomValues', { value: (array) => { array.fill(0); return array; } });
  });
  await page.goto('/');
  await assertRoundTrip(page);
  await expect(page.locator('#entropyLabel')).toHaveText('Estimated entropy');
});

test('real generated passwords round-trip at minimum and maximum UI lengths', async ({ page }) => {
  await page.goto('/');
  await readGenerated(page);
  for (const LENGTH of [1, 128]) {
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    await readGenerated(page);
    await page.locator('#length').fill(String(LENGTH));
    await expect.poll(async () => (await page.locator('#password').inputValue()).length).toBe(LENGTH);
    await assertRoundTrip(page);
  }
});

test('bundled memorable passphrase shows identical entropy in Analyse', async ({ page }) => {
  await page.goto('/');
  await readGenerated(page);
  await page.locator('#memorableGeneratorTab').click();
  await expect(page.locator('#password')).toHaveValue(/^[a-z]+(?:-[a-z]+){3}$/);
  await assertRoundTrip(page);
});

test('case, delimiter and numbered passphrase settings keep entropy consistent', async ({ page }) => {
  await page.route('**/eff_large_wordlist.txt', (route) => route.fulfill({ status: 200, body: '11111 door\n', contentType: 'text/plain' }));
  await page.goto('/');
  await readGenerated(page);
  await page.locator('#memorableGeneratorTab').click();
  await expect(page.locator('#password')).toHaveValue('door-door-door-door');
  await page.locator('#passphraseDelimiter').fill('::');
  await expect(page.locator('#password')).toHaveValue('door::door::door::door');
  await page.locator('#passphraseUseNumbers').check();
  await expect(page.locator('#password')).toHaveValue('d00r::d00r::d00r::d00r');
  await page.locator('#passphraseCaseCapitalise').check();
  await expect(page.locator('#password')).toHaveValue('D00r::D00r::D00r::D00r');
  await assertRoundTrip(page);
  await page.getByRole('button', { name: 'Generate', exact: true }).click();
  await readGenerated(page);
  await page.locator('#passphraseCaseUppercase').check();
  await expect(page.locator('#password')).toHaveValue('D00R::D00R::D00R::D00R');
  await assertRoundTrip(page);
});

test('same analysed input is independent of stored generator settings and reloads', async ({ page }) => {
  await page.goto('/#analyse');
  const SAMPLE = 'vN8#qL2%zR6&pX9';
  await page.locator('#analysisPassword').fill(SAMPLE);
  const BITS = await page.locator('#entropyValue').textContent();
  await page.getByRole('button', { name: 'Generate', exact: true }).click();
  await readGenerated(page);
  await page.locator('#includeUppercase').uncheck();
  await expect(page.locator('#password')).toHaveValue(/^[^A-Z]+$/);
  await page.reload();
  await page.getByRole('button', { name: 'Analyse', exact: true }).click();
  await page.locator('#analysisPassword').fill(SAMPLE);
  await expect(page.locator('#entropyValue')).toHaveText(BITS);
});

test('analysis handles hostile text locally without persisting passwords or sending data', async ({ page }) => {
  const REQUESTS = [];
  page.on('request', (request) => { REQUESTS.push({ url: request.url(), method: request.method(), body: request.postData() }); });
  await page.goto('/');
  const GENERATED = await readGenerated(page);
  await page.getByRole('button', { name: 'Analyse', exact: true }).click();
  const SAMPLE = '<img src=x onerror="window.__passwordExecuted=true">synthetic-private-input';
  await page.locator('#analysisPassword').fill(SAMPLE);
  await expect(page.locator('#feedbackContainer')).toBeVisible();
  expect(await page.evaluate(() => window.__passwordExecuted)).toBeUndefined();
  await expect(page.locator('img')).toHaveCount(0);
  const STORED = await page.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage } }));
  expect(STORED).not.toContain(SAMPLE);
  expect(STORED).not.toContain(GENERATED.password);
  expect(REQUESTS.every((request) => new URL(request.url).origin === new URL(page.url()).origin && request.method === 'GET' && request.body === null)).toBe(true);
  expect(REQUESTS.some((request) => request.url.includes('synthetic-private-input'))).toBe(false);
  await page.reload();
  await expect(page.locator('#analysisPassword')).toHaveValue('');
});

test('missing Web Crypto produces an error without a password', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(globalThis, 'crypto', { value: undefined }); });
  await page.goto('/');
  await expect(page.locator('#feedbackContainer')).toContainText('Unable to generate a password');
  await expect(page.locator('#password')).toHaveValue('');
  await expect(page.locator('#loading-spinner')).toBeHidden();
});

test('wordlist load failure is reported and can recover on retry', async ({ page }) => {
  await page.route('**/eff_large_wordlist.txt', (route) => route.fulfill({ status: 503, body: 'Unavailable' }));
  await page.goto('/');
  await readGenerated(page);
  await page.locator('#memorableGeneratorTab').click();
  await expect(page.locator('#feedbackContainer')).toContainText('Unable to generate a password');
  await page.unroute('**/eff_large_wordlist.txt');
  await page.locator('#passphraseWordCount').fill('5');
  await expect(page.locator('#password')).toHaveValue(/^[a-z]+(?:-[a-z]+){4}$/);
  await expect(page.locator('#feedbackContainer')).toBeHidden();
});

test('hash navigation, keyboard actions, show and clear remain usable', async ({ page }) => {
  await page.goto('/#analyze');
  await expect(page.locator('#analysePanel')).toBeVisible();
  await page.locator('#analysisPassword').fill('synthetic-only-password');
  await page.locator('#toggleAnalysisPassword').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#analysisPassword')).toHaveAttribute('type', 'text');
  await page.keyboard.press('Tab');
  await expect(page.locator('#clearAnalysisPassword')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#analysisPassword')).toHaveValue('');
  await expect(page.locator('#entropyValue')).toHaveText('0 bits');
  await page.locator('#generateModeButton').focus();
  expect(await page.locator('#generateModeButton').evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe('none');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#generate$/);
  await readGenerated(page);
});

test('main flows pass automated accessibility checks', async ({ page }) => {
  await page.goto('/');
  await readGenerated(page);
  for (const MODE of ['random', 'memorable', 'analyse']) {
    if (MODE === 'memorable') {
      await page.locator('#memorableGeneratorTab').click();
      await expect(page.locator('#password')).toHaveValue(/^[a-z]+(?:-[a-z]+){3}$/);
    } else if (MODE === 'analyse') {
      await page.locator('#analyseModeButton').click();
      await page.locator('#analysisPassword').fill('synthetic-only-password');
    }
    const RESULTS = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(RESULTS.violations, `${MODE}: ${JSON.stringify(RESULTS.violations.map((item) => ({ id: item.id, impact: item.impact, nodes: item.nodes.map((node) => node.target) })))}`).toEqual([]);
  }
});

test('layout and essential controls remain reachable with reduced motion and 200% text', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await readGenerated(page);
  for (const MODE of ['generate', 'analyse']) {
    await page.locator(`#${MODE}ModeButton`).click();
    if (MODE === 'generate') await readGenerated(page);
    else await page.locator('#analysisPassword').fill('synthetic-only-password');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  await page.locator('#clearAnalysisPassword').scrollIntoViewIfNeeded();
  await page.locator('#clearAnalysisPassword').click();
  await expect(page.locator('#analysisPassword')).toHaveValue('');
});
