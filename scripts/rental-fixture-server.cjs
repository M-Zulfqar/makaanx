// Loopback-only, read-only HTTP fixtures. No database or real accounts.
// MAKAANX_FIXTURE_AUTH=1 enables SYNTHETIC sessions for admin browser tests;
// unsigned fixture JWT subjects are trusted here ONLY, never by application code.
const http = require('node:http');
const port = Number(process.env.MAKAANX_FIXTURE_PORT || 54329);
const authFixtures = process.env.MAKAANX_FIXTURE_AUTH === '1';
const adminId = '50000000-0000-4000-8000-000000000001';
const landlordId = '20000000-0000-4000-8000-000000000001';
const tenantId = '10000000-0000-4000-8000-000000000001';
const profiles = [
  { id: adminId, role: 'admin' }, { id: landlordId, role: 'landlord' },
  ...Array.from({ length: 4 }, (_, i) => ({ id: `10000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`, role: 'tenant' })),
].map(row => ({ ...row, full_name: `Fixture ${row.role}`, verification_status: 'pending', cnic_path: 'PRIVATE_FIXTURE_DOCUMENT_NOT_FOR_OUTPUT' }));
const rows = Array.from({ length: 25 }, (_, offset) => {
  const i = offset + 1;
  return { id: `30000000-0000-4000-8000-${String(i).padStart(12, '0')}`, landlord_id: landlordId,
    title: `Fixture rental ${String(i).padStart(2, '0')}`, address: `Fixture street ${i}`, city: i % 2 ? 'Karachi' : 'Lahore',
    type: i % 2 ? 'Apartment' : 'House', rent: 20000 + i * 1000, bedrooms: i % 4, bathrooms: 1, area: 500 + i * 20,
    status: authFixtures && i === 25 ? 'occupied' : 'vacant', created_at: `2026-11-${String(i).padStart(2, '0')}T00:00:00Z` };
});
const applications = [
  { id: '40000000-0000-4000-8000-000000000001', property_id: rows[0].id, tenant_id: tenantId, status: 'pending', created_at: '2026-11-14T00:00:00Z' },
  { id: '40000000-0000-4000-8000-000000000002', property_id: rows[1].id, tenant_id: profiles[3].id, status: 'approved', created_at: '2026-11-13T00:00:00Z' },
];
function caller(req) {
  if (!authFixtures) return null;
  try {
    const token = String(req.headers.authorization || '').split(' ')[1];
    const subject = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()).sub;
    return profiles.find(row => row.id === subject) || null;
  } catch { return null; }
}
function matches(row, key, value) {
  const at = value.indexOf('.'), operator = value.slice(0, at), operand = value.slice(at + 1);
  if (operator === 'eq') return String(row[key]) === operand;
  if (operator === 'gte') return Number(row[key]) >= Number(operand);
  if (operator === 'lte') return Number(row[key]) <= Number(operand);
  if (operator === 'ilike') return String(row[key]).toLowerCase().includes(operand.slice(1, -1).replace(/\\([%_\\])/g, '$1').toLowerCase());
  if (operator === 'in') return operand.slice(1, -1).split(',').map(v => v.replaceAll('"', '')).includes(String(row[key]));
  if (operator === 'is' && operand === 'null') return row[key] == null;
  if (operator === 'not' && operand === 'is.null') return row[key] != null;
  return false;
}
const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json'); res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization,apikey,x-client-info,content-type,prefer,range');
  if (req.method === 'OPTIONS') { res.end(); return; }
  const url = new URL(req.url, `http://127.0.0.1:${port}`), user = caller(req);
  if (authFixtures && url.pathname === '/rest/v1/rpc/makaanx_is_admin' && req.method === 'POST') {
    res.end(JSON.stringify(Boolean(user?.role === 'admin'))); return; // Read-only scalar RPC fixture.
  }
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(JSON.stringify({ code: 'READ_ONLY_FIXTURE' })); return; }
  if (url.pathname === '/health') { res.end(JSON.stringify({ fixture: true, syntheticAuth: authFixtures })); return; }
  if (url.pathname === '/auth/v1/user') {
    if (!user) { res.writeHead(401); res.end(JSON.stringify({ code: 'session_not_found', message: 'No synthetic fixture session' })); return; }
    res.end(JSON.stringify({ id: user.id, aud: 'authenticated', role: 'authenticated', email: 'fixture@example.invalid', created_at: '2026-11-01T00:00:00Z', app_metadata: {}, user_metadata: {} })); return;
  }
  const table = url.pathname.replace('/rest/v1/', '');
  let permitted;
  if (table === 'properties') permitted = rows;
  // Model the known visibility symptom without claiming it reproduces real RLS.
  else if (authFixtures && table === 'profiles') permitted = user ? profiles.filter(row => row.id === user.id) : [];
  else if (authFixtures && table === 'applications') permitted = !user ? [] : user.role === 'tenant' ? applications.filter(row => row.tenant_id === user.id) : applications;
  else { res.writeHead(404); res.end(JSON.stringify({ code: 'FIXTURE_ROUTE_UNAVAILABLE' })); return; }
  if ((url.searchParams.get('title') || '').replace(/\\/g, '').includes('force_error')) { res.writeHead(500); res.end(JSON.stringify({ code: 'XX000', message: 'PRIVATE_DATABASE_DETAIL' })); return; }
  let result = permitted.filter(row => [...url.searchParams].every(([key, value]) => ['select', 'order', 'offset', 'limit'].includes(key) || matches(row, key, value)));
  const total = result.length, order = (url.searchParams.get('order') || 'id.asc').split(',');
  result.sort((a, b) => { for (const term of order) { const [key, direction] = term.split('.'); const cmp = typeof a[key] === 'number' ? a[key] - b[key] : String(a[key]).localeCompare(String(b[key])); if (cmp) return direction === 'desc' ? -cmp : cmp; } return 0; });
  const offset = Number(url.searchParams.get('offset') || 0), limit = Number(url.searchParams.get('limit') || 1000);
  result = result.slice(offset, offset + limit);
  const projection = url.searchParams.get('select');
  if (projection && projection !== '*') result = result.map(row => Object.fromEntries(projection.split(',').map(key => [key, row[key]])));
  res.setHeader('Content-Range', `${result.length ? `${offset}-${offset + result.length - 1}` : '*'}/${total}`);
  if (req.method === 'HEAD') { res.end(); return; }
  if ((req.headers.accept || '').includes('vnd.pgrst.object')) {
    if (result.length !== 1) { res.writeHead(406); res.end(JSON.stringify({ code: 'PGRST116' })); return; }
    res.end(JSON.stringify(result[0])); return;
  }
  res.end(JSON.stringify(result));
});
server.listen(port, '127.0.0.1', () => console.log(`Read-only fixtures on 127.0.0.1:${port}; synthetic sessions ${authFixtures ? 'enabled' : 'disabled'}`));
