/**
 * 경력(careers)에 YouTube URL을 채우기 위한 헬퍼.
 *
 * 1) 동영상 없는 경력 목록 조회 (Supabase MCP에서 실행):
 *    SELECT c.id, c.dancer_id, c.type, c.title, d.slug
 *    FROM careers c
 *    JOIN dancers d ON d.id = c.dancer_id
 *    WHERE (c.details->>'youtube_url' IS NULL OR c.details->>'youtube_url' = ''
 *           OR NOT (c.details->>'youtube_url' ~ 'youtube\\.com/watch\\?v=|youtu\\.be/'))
 *      AND (c.details->>'link' IS NULL OR c.details->>'link' = ''
 *           OR NOT (c.details->>'link' ~ 'youtube\\.com/watch\\?v=|youtu\\.be/'))
 *      AND d.slug = 'amy'   -- 테스트 시 한 명만
 *    ORDER BY c.date DESC;
 *
 * 2) 웹에서 제목으로 'practice video' / '연습영상' / '안무 시안' 검색 후
 *    updates.json 작성: [ { "id": 685, "youtube_url": "https://..." }, ... ]
 *
 * 3) 이 스크립트로 UPDATE SQL 생성 후 Supabase MCP execute_sql 또는 대시보드에서 실행:
 *    node scripts/fill-career-youtube.js [updates.json]
 *
 * 사용 예:
 *   node scripts/fill-career-youtube.js scripts/career-youtube-updates.json
 */

const fs = require('fs');
const path = require('path');

const updatesPath = process.argv[2] || path.join(__dirname, 'career-youtube-updates.json');
let updates;
try {
  updates = JSON.parse(fs.readFileSync(updatesPath, 'utf8'));
} catch (e) {
  console.error('Usage: node scripts/fill-career-youtube.js [path/to/updates.json]');
  console.error('  updates.json: [ { "id": 685, "youtube_url": "https://..." }, ... ]');
  process.exit(1);
}

if (!Array.isArray(updates) || updates.length === 0) {
  console.log('No updates in', updatesPath);
  process.exit(0);
}

// JSON 문자열 내부에 넣을 URL 이스케이프 (\, " 처리)
function escapeJsonString(s) {
  if (s == null || s === '') return '';
  return String(s)
    .trim()
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');
}

const statements = updates
  .filter((u) => u.id != null && u.youtube_url && /youtube\.com\/watch\?v=|youtu\.be\//.test(u.youtube_url))
  .map((u) => {
    const url = escapeJsonString(u.youtube_url);
    return `UPDATE careers SET details = jsonb_set(COALESCE(details, '{}'::jsonb), '{youtube_url}', '"${url}"') WHERE id = ${Number(u.id)};`;
  });

if (statements.length === 0) {
  console.log('No valid updates (id + youtube_url required).');
  process.exit(0);
}

const sql = statements.join('\n');
console.log('-- Run in Supabase SQL Editor or via MCP execute_sql (one or batch):\n');
console.log(sql);
console.log('\n-- Count:', statements.length);
