-- 기존 프로필·경력의 created_at 기준으로 등록로그(create) 보강
-- 이미 admin_logs에 해당 target의 create 로그가 있으면 건너뜀

INSERT INTO public.admin_logs (action, target_type, target_id, target_label, details, created_at)
SELECT 'create', 'profile', d.id::text, d.stage_name, NULL, d.created_at
FROM public.dancers d
WHERE NOT EXISTS (
  SELECT 1 FROM public.admin_logs l
  WHERE l.target_type = 'profile' AND l.target_id = d.id::text AND l.action = 'create'
);

INSERT INTO public.admin_logs (action, target_type, target_id, target_label, details, created_at)
SELECT 'create', 'career', c.id::text, c.title, jsonb_build_object('dancer_id', c.dancer_id), c.created_at
FROM public.careers c
WHERE NOT EXISTS (
  SELECT 1 FROM public.admin_logs l
  WHERE l.target_type = 'career' AND l.target_id = c.id::text AND l.action = 'create'
);
