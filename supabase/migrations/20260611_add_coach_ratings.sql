-- Add rating columns to consultations table
ALTER TABLE public.consultations
  ADD COLUMN rating         smallint CHECK (rating BETWEEN 1 AND 5),
  ADD COLUMN rating_comment text,
  ADD COLUMN rated_at       timestamptz;

-- Create get_top_rated_coach() RPC
CREATE OR REPLACE FUNCTION get_top_rated_coach()
RETURNS TABLE (
  id integer,
  username varchar,
  email varchar,
  avg_rating numeric,
  rating_count bigint
)
LANGUAGE sql STABLE AS $$
  SELECT
    u.id, u.username, u.email,
    ROUND(AVG(c.rating)::numeric, 1) AS avg_rating,
    COUNT(c.rating)                  AS rating_count
  FROM users u
  JOIN consultations c ON c.coach_id = u.id
  WHERE u.user_role = 'admin'
    AND u.is_active = true
    AND c.rating IS NOT NULL
    AND c.status = 'completed'
  GROUP BY u.id, u.username, u.email
  HAVING COUNT(c.rating) >= 1
  ORDER BY avg_rating DESC, rating_count DESC
  LIMIT 1;
$$;

-- Create get_coaches_with_ratings() RPC
CREATE OR REPLACE FUNCTION get_coaches_with_ratings()
RETURNS TABLE (
  id integer,
  username varchar,
  email varchar,
  user_role text,
  is_active boolean,
  avg_rating numeric,
  rating_count bigint
)
LANGUAGE sql STABLE AS $$
  SELECT
    u.id, u.username, u.email, u.user_role::text, u.is_active,
    ROUND(AVG(c.rating)::numeric, 1) AS avg_rating,
    COUNT(c.rating)                  AS rating_count
  FROM users u
  LEFT JOIN consultations c ON c.coach_id = u.id
    AND c.rating IS NOT NULL
    AND c.status = 'completed'
  WHERE u.user_role = 'admin'
  GROUP BY u.id, u.username, u.email, u.user_role, u.is_active
  ORDER BY avg_rating DESC NULLS LAST, u.created_at DESC;
$$;
