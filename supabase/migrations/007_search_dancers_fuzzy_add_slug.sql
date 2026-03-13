-- Add slug to search_dancers_fuzzy result so profile links use clean URLs
DROP FUNCTION IF EXISTS public.search_dancers_fuzzy(text, real);
CREATE OR REPLACE FUNCTION public.search_dancers_fuzzy(search_query text, similarity_threshold real DEFAULT 0.2)
RETURNS TABLE(
  id uuid,
  stage_name text,
  korean_name text,
  profile_img text,
  bio text,
  specialties text[],
  genres text[],
  location text,
  is_verified boolean,
  similarity_score real,
  slug text
)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.stage_name,
    d.korean_name,
    d.profile_img,
    d.bio,
    d.specialties,
    d.genres,
    d.location,
    d.is_verified,
    GREATEST(
      SIMILARITY(d.stage_name, search_query),
      COALESCE(SIMILARITY(d.korean_name, search_query), 0)
    )::real AS similarity_score,
    d.slug
  FROM dancers d
  WHERE
    SIMILARITY(d.stage_name, search_query) > similarity_threshold
    OR COALESCE(SIMILARITY(d.korean_name, search_query), 0) > similarity_threshold
    OR d.stage_name ILIKE '%' || search_query || '%'
    OR d.korean_name ILIKE '%' || search_query || '%'
  ORDER BY similarity_score DESC, d.stage_name
  LIMIT 20;
END;
$function$;
