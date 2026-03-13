/**
 * Parse tests/e2e/tamzin.txt (strip // comments) and output SQL INSERTs for careers.
 * Run: node scripts/insert-tamzin-careers.js
 */
const fs = require('fs');
const path = require('path');

const DANCER_ID = 'd5b01568-7a9f-4f2b-8898-ad1ca8d97b79';
const filePath = path.join(__dirname, '..', 'tests', 'e2e', 'tamzin.txt');
let raw = fs.readFileSync(filePath, 'utf8');
// Remove line comments (// ...)
raw = raw.replace(/\/\/[^\n]*/g, '');
// Parse JSON array
const items = JSON.parse(raw);

function escapeSql(s) {
  if (s == null) return 'NULL';
  return "'" + String(s).replace(/'/g, "''") + "'";
}

function parseDate(d) {
  if (d == null || d === '') return null;
  const s = String(d).trim();
  const range = s.match(/^(\d{4}-\d{2}-\d{2})~/);
  if (range) return range[1];
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (/^\d{4}$/.test(s)) return s + '-01-01';
  return null;
}

const careers = items.filter((x) => x && x.type);
const values = careers.map((c) => {
  const dateVal = parseDate(c.date);
  const dateSql = dateVal ? escapeSql(dateVal) : "CURRENT_DATE";
  const details = c.details != null ? { role: c.details, description: c.details } : {};
  const detailsSql = escapeSql(JSON.stringify(details));
  return `(${escapeSql(DANCER_ID)}, ${escapeSql(c.type)}, ${escapeSql(c.title)}, ${dateSql}::date, ${detailsSql}::jsonb)`;
});

// Batch by 50 to avoid query size limits; write to file for MCP
const batchSize = 50;
const outPath = path.join(__dirname, '..', 'scripts', 'tamzin-careers-batches.json');
const batches = [];
for (let i = 0; i < values.length; i += batchSize) {
  const batch = values.slice(i, i + batchSize);
  const sql = `INSERT INTO careers (dancer_id, type, title, date, details) VALUES\n${batch.join(',\n')}`;
  batches.push(sql);
}
fs.writeFileSync(outPath, JSON.stringify(batches, null, 0), 'utf8');
console.log('Written', batches.length, 'batches to', outPath);
