-- ============================================================
-- get_dancers_by_category: 홈 탭 댄서 목록 (카테고리별 + 우선순위 정렬)
-- 정렬: 1) 사진 유무 2) 매니저 등록 3) 커리어/영상 수 4) 본인참여 매칭 완료
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_dancers_by_category(category text, lim int DEFAULT 30)
RETURNS SETOF public.dancers
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  WITH career_stats AS (
    SELECT
      c.dancer_id,
      COUNT(*)::int AS career_count,
      COUNT(*) FILTER (WHERE
        (c.details->>'youtube_url') ~ 'youtube\.com|youtu\.be'
        OR (c.details->>'link') ~ 'youtube\.com|youtu\.be'
      )::int AS video_count
    FROM public.careers c
    GROUP BY c.dancer_id
  )
  SELECT d.*
  FROM public.dancers d
  LEFT JOIN career_stats s ON s.dancer_id = d.id
  WHERE
    (d.is_verified IS NULL OR d.is_verified = true)
    AND (
      category = 'all'
      OR (category = 'battler' AND d.specialties IS NOT NULL AND 'battle' = ANY(d.specialties))
      OR (category = 'choreographer' AND d.specialties IS NOT NULL AND 'choreo' = ANY(d.specialties))
    )
  ORDER BY
    (d.profile_img IS NOT NULL AND trim(COALESCE(d.profile_img, '')) <> '') DESC,
    (d.manager_id IS NOT NULL) DESC,
    COALESCE(s.career_count, 0) DESC,
    COALESCE(s.video_count, 0) DESC,
    (d.owner_id IS NOT NULL) DESC,
    d.created_at DESC NULLS LAST
  LIMIT NULLIF(lim, 0);
$$;

COMMENT ON FUNCTION public.get_dancers_by_category(text, int) IS
  '홈 탭 댄서 목록: 카테고리(all|battler|choreographer) 필터 + 사진/매니저/커리어·영상수/본인참여 매칭 우선 정렬';
