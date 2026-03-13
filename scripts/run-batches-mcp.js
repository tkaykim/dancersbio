/**
 * Read batch SQL files and output each as single-line JSON string for MCP execute_sql.
 * Usage: node scripts/run-batches-mcp.js
 * Then use the output query value in call_mcp_tool execute_sql.
 */
const fs = require('fs');
const path = require('path');
for (let i = 2; i <= 3; i++) {
  const sql = fs.readFileSync(path.join(__dirname, `batch${i}.sql`), 'utf8');
  const escaped = JSON.stringify(sql);
  fs.writeFileSync(path.join(__dirname, `batch${i}-query.json`), escaped, 'utf8');
  console.log('Batch', i, 'length', escaped.length);
}
