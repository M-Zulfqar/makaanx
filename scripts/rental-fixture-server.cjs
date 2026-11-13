// Isolated, read-only PostgREST-shaped fixtures. No database or accounts.
const http = require('node:http');
const port = Number(process.env.MAKAANX_FIXTURE_PORT || 54329);
const rows = Array.from({ length: 25 }, (_, offset) => {
  const i = offset + 1;
  return { id: `30000000-0000-4000-8000-${String(i).padStart(12, '0')}`, landlord_id: '20000000-0000-4000-8000-000000000001',
    title: `Fixture rental ${String(i).padStart(2, '0')}`, address: `Fixture street ${i}`, city: i % 2 ? 'Karachi' : 'Lahore',
    type: i % 2 ? 'Apartment' : 'House', rent: 20000 + i * 1000, bedrooms: i % 4, bathrooms: 1, area: 500 + i * 20,
    status: 'vacant', created_at: `2026-11-${String(i).padStart(2, '0')}T00:00:00Z` };
});
const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json'); res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization,apikey,x-client-info,content-type,prefer,range');
  if (req.method === 'OPTIONS') { res.end(); return; }
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(JSON.stringify({ code: 'READ_ONLY_FIXTURE' })); return; }
  const url = new URL(req.url, `http://127.0.0.1:${port}`);
  if (url.pathname === '/health') { res.end(JSON.stringify({ fixture: true })); return; }
  if (url.pathname === '/auth/v1/user') { res.writeHead(401); res.end(JSON.stringify({ code: 'session_not_found', message: 'Fixture requires no authentication' })); return; }
  if (url.pathname !== '/rest/v1/properties') { res.writeHead(404); res.end(JSON.stringify({ code: 'FIXTURE_ROUTE_UNAVAILABLE' })); return; }
  if ((url.searchParams.get('title') || '').replace(/\\/g, '').includes('force_error')) { res.writeHead(500); res.end(JSON.stringify({ code: 'XX000', message: 'PRIVATE_DATABASE_DETAIL' })); return; }
  let result = rows.filter(row => [...url.searchParams].every(([key, value]) => {
    if (['select', 'order', 'offset', 'limit'].includes(key)) return true;
    const at = value.indexOf('.'), operator = value.slice(0, at), operand = value.slice(at + 1);
    if (operator === 'eq') return String(row[key]) === operand;
    if (operator === 'gte') return Number(row[key]) >= Number(operand);
    if (operator === 'lte') return Number(row[key]) <= Number(operand);
    if (operator === 'ilike') return String(row[key]).toLowerCase().includes(operand.slice(1, -1).replace(/\\([%_\\])/g, '$1').toLowerCase());
    return false;
  }));
  const total = result.length;
  const order = (url.searchParams.get('order') || 'id.asc').split(',');
  result.sort((a, b) => { for (const term of order) { const [key, direction] = term.split('.'); const cmp = typeof a[key] === 'number' ? a[key] - b[key] : String(a[key]).localeCompare(String(b[key])); if (cmp) return direction === 'desc' ? -cmp : cmp; } return 0; });
  const offset = Number(url.searchParams.get('offset') || 0), limit = Number(url.searchParams.get('limit') || 1000);
  result = result.slice(offset, offset + limit);
  res.setHeader('Content-Range', `${result.length ? `${offset}-${offset + result.length - 1}` : '*'}/${total}`);
  if (req.method === 'HEAD') { res.end(); return; }
  if ((req.headers.accept || '').includes('vnd.pgrst.object')) {
    if (result.length !== 1) { res.writeHead(406); res.end(JSON.stringify({ code: 'PGRST116' })); return; }
    res.end(JSON.stringify(result[0])); return;
  }
  res.end(JSON.stringify(result));
});
server.listen(port, '127.0.0.1', () => console.log(`Read-only rental fixtures on 127.0.0.1:${port}`));
