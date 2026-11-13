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
    for (const path of ['/', '/properties', '/properties/1', '/auth/login', '/auth/signup', '/auth/diagnostics', '/admin/users', '/landlord/manage', '/dashboard']) {
      const response = await page.goto(new URL(path, base).href);
      assert.equal(response.status(), 200, `${path}: unexpected status`);
      const destination = new URL(page.url()).pathname;
      assert.equal(destination, ['/admin/users', '/landlord/manage', '/dashboard'].includes(path) ? '/auth/login' : path);
      await page.locator('body').waitFor({ state: 'visible' });
      checks++; console.log(`PASS route ${path}`);
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
