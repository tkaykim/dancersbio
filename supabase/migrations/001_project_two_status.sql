-- ============================================================
-- Migration: projects.status → confirmation_status + progress_status
-- 실행: Supabase Dashboard > SQL Editor 에서 실행하세요
-- ============================================================

-- 1. 새 컬럼 추가
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS confirmation_status text NOT NULL DEFAULT 'negotiating',
  ADD COLUMN IF NOT EXISTS progress_status text NOT NULL DEFAULT 'idle';

-- 2. 기존 status 데이터를 새 컬럼으로 마이그레이션
UPDATE projects SET
  confirmation_status = CASE
    WHEN status = 'recruiting' THEN 'negotiating'
    WHEN status = 'active' THEN 'confirmed'
    WHEN status = 'done' THEN 'completed'
    WHEN status = 'completed' THEN 'completed'
    WHEN status = 'cancelled' THEN 'cancelled'
    ELSE 'negotiating'
  END,
  progress_status = CASE
    WHEN status = 'recruiting' THEN 'idle'
    WHEN status = 'active' THEN 'recruiting'
    WHEN status = 'done' THEN 'completed'
    WHEN status = 'completed' THEN 'completed'
    WHEN status = 'cancelled' THEN 'cancelled'
    ELSE 'idle'
  END;

-- 3. 기존 status 컬럼 삭제
ALTER TABLE projects DROP COLUMN IF EXISTS status;

-- 4. 확인
SELECT id, title, confirmation_status, progress_status FROM projects;
