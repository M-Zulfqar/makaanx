// MakaanX staging-only Auth signup smoke test. Run with Node 20+.
// Uses only the public publishable/anon key. Never use service-role credentials.
// Requires STAGING_SUPABASE_URL and STAGING_SUPABASE_KEY in the process environment.
// Example: node scripts/test-staging-signup.mjs landlord
import { createClient } from '@supabase/supabase-js';

const role = process.argv[2];
if (!['landlord', 'admin'].includes(role)) {
  console.error('Usage: node scripts/test-staging-signup.mjs landlord|admin');
  process.exit(1);
}
const url = process.env.STAGING_SUPABASE_URL;
const key = process.env.STAGING_SUPABASE_KEY;
if (!url || !key) {
  console.error('Missing STAGING_SUPABASE_URL or STAGING_SUPABASE_KEY.');
  process.exit(1);
}
const hostname = new URL(url).hostname;
const expectedHostname = process.env.STAGING_EXPECTED_HOST;
if (!expectedHostname || hostname !== expectedHostname || !hostname.endsWith('.supabase.co')) {
  console.error('Safety check failed. Confirm STAGING_EXPECTED_HOST matches the staging project hostname:', hostname);
  process.exit(1);
}
const email = process.env.STAGING_TEST_EMAIL;
const password = process.env.STAGING_TEST_PASSWORD;
if (!email || !password || password.length < 12) {
  console.error('Set STAGING_TEST_EMAIL and a unique STAGING_TEST_PASSWORD of 12+ characters.');
  process.exit(1);
}
const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { data, error } = await client.auth.signUp({
  email, password,
  options: { data: { role, full_name: 'MakaanX Staging Test', phone: '' } },
});
if (error) {
  console.error('Signup failed:', error.message);
  process.exit(1);
}
console.log('Signup request accepted.');
console.log('Requested role:', role);
console.log('User returned:', Boolean(data.user));
console.log('Session returned:', Boolean(data.session));
console.log('Check profile role with the read-only SQL query in staging.');
