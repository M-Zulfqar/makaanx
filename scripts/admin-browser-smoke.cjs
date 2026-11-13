// Local synthetic-session tests only. These are NOT Supabase/RLS staging tests.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = new URL(process.env.MAKAANX_SMOKE_BASE_URL || 'http://127.0.0.1:3000');
if (!['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname)) throw new Error('Loopback URL required.');
const subjects = { admin: '50000000-0000-4000-8000-000000000001', tenant: '10000000-0000-4000-8000-000000000001', landlord: '20000000-0000-4000-8000-000000000001' };
function fixtureSession(role) {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const access_token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: subjects[role], role: 'authenticated', aud: 'authenticated', exp })}.synthetic-not-a-real-signature`;
  return `base64-${encode({ access_token, refresh_token: 'synthetic-refresh-only', token_type: 'bearer', expires_in: 3600, expires_at: exp, user: { id: subjects[role], role: 'authenticated' } })}`;
}
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}) });
  let checks = 0;
  try {
    for (const role of ['anonymous', 'tenant', 'landlord', 'admin']) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
      if (role !== 'anonymous') await context.addCookies([{ name: 'sb-127-auth-token', value: fixtureSession(role), domain: base.hostname, path: '/', sameSite: 'Lax' }]);
      const page = await context.newPage();
      const errors = []; page.on('pageerror', () => errors.push('RUNTIME_ERROR'));
      for (const route of ['/admin/properties', '/admin/reports', '/admin/analytics']) {
        await page.goto(new URL(route, base).href);
        if (role !== 'admin') {
          assert.equal(new URL(page.url()).pathname, role === 'anonymous' ? '/auth/login' : '/auth/unauthorized');
        } else {
          await page.getByRole('heading', { name: route.endsWith('properties') ? 'Properties' : route.endsWith('reports') ? 'Reports management' : 'Administration analytics', exact: true }).waitFor();
          await page.getByRole('heading', { name: 'Accessible data · platform coverage unverified' }).waitFor();
          assert.equal((await page.content()).includes('PRIVATE_FIXTURE_DOCUMENT'), false);
          if (route.endsWith('analytics')) {
            const visibleUsers = page.getByRole('heading', { name: 'Accessible users', exact: true }).locator('..');
            assert.equal(await visibleUsers.locator('p').first().textContent(), '1');
            const eligible = page.getByRole('heading', { name: 'Pending eligible profiles', exact: true }).locator('..');
            assert.equal(await eligible.locator('p').first().textContent(), '0');
            checks++; console.log('PASS analytics displays restricted counts and excludes admin verification');
          }
        }
        checks++; console.log(`PASS ${role} ${route}`);
      }
      if (role === 'admin') {
        await page.goto(new URL('/admin/properties', base).href);
        await page.getByRole('heading', { name: 'Fixture rental 25', exact: true }).waitFor(); // occupied is included
        await page.getByRole('link', { name: 'Next', exact: true }).click(); await page.waitForURL(/page=2/);
        checks++; console.log('PASS administrator pagination includes occupied listings');
        await page.getByLabel('Listing status').fill('occupied'); await page.getByRole('button', { name: 'Search', exact: true }).click();
        await page.waitForURL(/status=occupied/); await page.getByRole('heading', { name: 'Fixture rental 25', exact: true }).waitFor(); assert.equal(await page.getByRole('heading', { name: /^Fixture rental/ }).count(), 1);
        await page.getByText('Name unavailable in permitted profile records', { exact: false }).waitFor();
        checks++; console.log('PASS status filter and restricted owner information');
        assert.equal(await page.getByRole('button', { name: /Delete|Approve|Reject|Save changes/ }).count(), 0);
        checks++; console.log('PASS no moderation write controls');
        await page.setViewportSize({ width: 375, height: 812 });
        await page.getByRole('button', { name: 'Open administration menu' }).click();
        await page.getByRole('link', { name: 'Reports', exact: true }).click();
        await page.getByRole('heading', { name: 'Reports management', exact: true }).waitFor();
        checks++; console.log('PASS mobile administration navigation');
      }
      assert.equal(errors.length, 0); checks++; console.log(`PASS ${role} no runtime errors`);
      await context.close();
    }
    console.log(`${checks} administration browser checks passed (synthetic sessions only)`);
  } finally { await browser.close(); }
})().catch(() => { console.error('Administration browser checks failed; no cookies, JWTs, bodies or identity data were logged.'); process.exitCode = 1; });
