// Local production-build smoke checks. Never use a staging/production URL.
// npm run build (dummy public Supabase config), npm start, then npm run test:browser.
// Set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH for an existing system Chromium, or
// install the matching browser with `npx playwright install chromium`.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = new URL(process.env.MAKAANX_SMOKE_BASE_URL || 'http://127.0.0.1:3000');
if (!['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname) || !['http:', 'https:'].includes(base.protocol)) {
  throw new Error('Browser smoke checks require a loopback URL.');
}
(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}),
  });
  let checks = 0;
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    // Even if a developer accidentally starts a real-configured local build,
    // browser checks must never send credentials or read actual Supabase data.
    await context.route('**/*.supabase.co/**', route => route.abort());
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', () => pageErrors.push('BROWSER_RUNTIME_ERROR'));
    for (const path of ['/', '/properties', '/auth/login', '/auth/signup', '/auth/diagnostics', '/admin/users', '/landlord/manage', '/dashboard']) {
      const response = await page.goto(new URL(path, base).href);
      assert.equal(response.status(), 200, `${path}: unexpected status`);
      const destination = new URL(page.url()).pathname;
      assert.equal(destination, ['/admin/users', '/landlord/manage', '/dashboard'].includes(path) ? '/auth/login' : path);
      await page.locator('body').waitFor({ state: 'visible' });
      checks++; console.log(`PASS route ${path}`);
    }
    const invalid = await page.goto(new URL('/properties/not-a-uuid', base).href);
    assert.ok([200, 404].includes(invalid.status()));
    await page.getByRole('heading', { name: '404', exact: true }).waitFor();
    checks++; console.log('PASS invalid listing ID renders not-found (App Router may stream HTTP 200)');
    if (process.env.MAKAANX_RENTAL_FIXTURES === '1') {
      await page.goto(new URL('/properties', base).href);
      assert.equal(await page.locator('main h2').count(), 12);
      await page.getByRole('link', { name: 'Next', exact: true }).click();
      await page.waitForURL(/page=2/); assert.equal(await page.locator('main h2').count(), 12);
      checks++; console.log('PASS live-fixture pagination');
      await page.getByLabel('Search title').fill('Fixture rental 01');
      await page.getByRole('button', { name: 'Search', exact: true }).click();
      await page.waitForURL(/q=Fixture/); await page.getByRole('heading', { name: 'Fixture rental 01', exact: true }).waitFor();
      assert.equal(await page.locator('main h2').count(), 1); checks++; console.log('PASS live-fixture title search');
      await page.goto(new URL('/properties?city=Lahore&type=House&min=25000&max=35000&sort=rent_low', base).href);
      assert.equal(await page.locator('main h2').count(), 5); checks++; console.log('PASS live-fixture city/type/budget/sort');
      await page.goto(new URL('/marketplace?sort=rent_low', base).href);
      assert.equal(await page.locator('main h2').first().textContent(), 'Fixture rental 01');
      checks++; console.log('PASS shared marketplace source and ascending rent');
      const detail = await page.goto(new URL('/properties/30000000-0000-4000-8000-000000000001', base).href);
      assert.equal(detail.status(), 200); await page.getByRole('heading', { name: 'Fixture rental 01', exact: true }).waitFor();
      checks++; console.log('PASS real-source property details');
      await page.goto(new URL('/properties?q=force_error', base).href);
      await page.locator('main [role=alert]').waitFor();
      assert.equal(await page.getByText('No matching listings on this page').count(), 0);
      assert.equal((await page.locator('body').innerText()).includes('PRIVATE_DATABASE_DETAIL'), false);
      checks++; console.log('PASS query failure is not an empty state or raw database message');
      await page.goto(new URL('/properties?q=does-not-exist', base).href);
      await page.getByRole('heading', { name: 'No matching listings on this page' }).waitFor();
      checks++; console.log('PASS genuine empty search state');
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(new URL('/properties', base).href);
      await page.getByRole('button', { name: 'Search', exact: true }).waitFor({ state: 'visible' });
      assert.equal(await page.locator('main h2').count(), 12); checks++; console.log('PASS mobile live catalog');
    }
    await page.goto(new URL('/auth/diagnostics', base).href);
    const diagnosticResponse = await context.request.get(new URL('/auth/diagnostics/server', base).href);
    assert.equal(diagnosticResponse.status(), 401);
    assert.match(diagnosticResponse.headers()['cache-control'], /private, no-store/);
    const report = await diagnosticResponse.json();
    assert.deepEqual(Object.keys(report).sort(), ['accessibleProfileCount', 'adminRpcResult', 'authenticatedRole', 'errorCodes', 'projectReference'].sort());
    assert.equal(report.accessibleProfileCount, null); assert.equal(report.adminRpcResult, null);
    checks++; console.log('PASS unauthenticated diagnostic privacy and caching');
    await page.getByRole('button', { name: 'Run read-only diagnostics' }).click();
    await page.locator('pre').first().waitFor();
    assert.equal(await page.locator('pre').count(), 2);
    for (const text of await page.locator('pre').allTextContents()) {
      const result = JSON.parse(text);
      assert.equal(result.accessibleProfileCount, null); assert.equal(result.adminRpcResult, null);
      assert.deepEqual(Object.keys(result).sort(), Object.keys(report).sort());
    }
    checks++; console.log('PASS browser/server diagnostic UI');
    await page.evaluate(() => {
      localStorage.setItem('makaanx-theme', 'midnight'); localStorage.setItem('makaanx-language', 'ur');
    });
    await page.goto(new URL('/auth/login', base).href);
    await page.waitForFunction(() => document.documentElement.classList.contains('theme-midnight') && document.documentElement.lang === 'ur' && document.documentElement.dir === 'rtl');
    await page.reload();
    await page.waitForFunction(() => document.documentElement.classList.contains('theme-midnight') && document.documentElement.dir === 'rtl');
    checks++; console.log('PASS persisted theme/language and reload');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.getByRole('button', { name: 'Tenant', exact: true }).waitFor({ state: 'visible' });
    checks++; console.log('PASS mobile login controls');
    assert.equal(pageErrors.length, 0, 'browser runtime/hydration error');
    checks++; console.log('PASS no browser runtime/hydration errors');
    console.log(`${checks} browser smoke checks passed`);
  } finally { await browser.close(); }
})().catch(() => { console.error('Browser smoke checks failed; no response bodies or session data were logged.'); process.exitCode = 1; });
