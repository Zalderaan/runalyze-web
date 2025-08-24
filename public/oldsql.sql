-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.analysis_results (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  head_position double precision,
  back_position double precision,
  arm_flexion double precision,
  right_knee double precision,
  left_knee double precision,
  foot_strike double precision,
  overall_score double precision,
  video_id bigint,
  user_id integer,
  feedback_id bigint,
  CONSTRAINT analysis_results_pkey PRIMARY KEY (id),
  CONSTRAINT analysis_results_feedback_id_fkey FOREIGN KEY (feedback_id) REFERENCES public.feedbacks(feedback_id),
  CONSTRAINT analysis_results_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT analysis_results_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.videos(video_id)
);
CREATE TABLE public.drills (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  area character varying NOT NULL DEFAULT ''::character varying,
  performance_level character varying NOT NULL,
  duration character varying,
  frequency character varying,
  video_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  instructions jsonb,
  CONSTRAINT drills_pkey PRIMARY KEY (id)
);
CREATE TABLE public.feedbacks (
  feedback_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  detailed_feedback json,
  strengths json,
  priority_areas json,
  overall_assessment text,
  CONSTRAINT feedbacks_pkey PRIMARY KEY (feedback_id)
);
CREATE TABLE public.users (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  email character varying,
  password text,
  username character varying,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.videos (
  video_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id integer,
  uploaded_at timestamp with time zone NOT NULL DEFAULT now(),
  video_url text,
  thumbnail_url text,
  CONSTRAINT videos_pkey PRIMARY KEY (video_id),
  CONSTRAINT videos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);