-- TEST-ONLY synthetic baseline, NOT a live migration or Supabase replacement.
-- Managed runner creates an isolated network-none DB before reading this file.
CREATE TABLE public.makaanx_disposable_marker(id boolean PRIMARY KEY CHECK(id),version text NOT NULL);
INSERT INTO public.makaanx_disposable_marker VALUES(true,'makaanx-local-v1');
REVOKE ALL ON SCHEMA public FROM PUBLIC;
CREATE ROLE anon NOLOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE authenticated NOLOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE tenant_a LOGIN INHERIT NOSUPERUSER NOBYPASSRLS;
CREATE ROLE tenant_b LOGIN INHERIT NOSUPERUSER NOBYPASSRLS;
CREATE ROLE landlord_a LOGIN INHERIT NOSUPERUSER NOBYPASSRLS;
CREATE ROLE landlord_b LOGIN INHERIT NOSUPERUSER NOBYPASSRLS;
CREATE ROLE admin_user LOGIN INHERIT NOSUPERUSER NOBYPASSRLS;
CREATE ROLE anonymous LOGIN INHERIT NOSUPERUSER NOBYPASSRLS;
GRANT authenticated TO tenant_a,tenant_b,landlord_a,landlord_b,admin_user;
GRANT anon TO anonymous;
GRANT USAGE ON SCHEMA public TO anon,authenticated;
CREATE SCHEMA auth;
CREATE SCHEMA storage;
GRANT USAGE ON SCHEMA auth,storage TO anon,authenticated;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE SET search_path='' AS $$
 SELECT CASE session_user
 WHEN 'tenant_a' THEN '10000000-0000-4000-8000-000000000001'::uuid
 WHEN 'tenant_b' THEN '10000000-0000-4000-8000-000000000002'::uuid
 WHEN 'landlord_a' THEN '20000000-0000-4000-8000-000000000001'::uuid
 WHEN 'landlord_b' THEN '20000000-0000-4000-8000-000000000002'::uuid
 WHEN 'admin_user' THEN '50000000-0000-4000-8000-000000000001'::uuid ELSE NULL END;
$$;
-- This fixed SESSION_USER mapping is a local Auth adapter, NOT JWT validation.
-- Actor roles cannot SET ROLE postgres, rewrite this mapping or change SESSION AUTHORIZATION.
CREATE TABLE auth.users(id uuid PRIMARY KEY,raw_user_meta_data jsonb NOT NULL DEFAULT '{}');
CREATE TABLE public.profiles(id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE RESTRICT,full_name text,phone text,role text NOT NULL CHECK(role IN('tenant','landlord','admin')),trust_score numeric,verification_score numeric,verification_status text DEFAULT 'pending',cnic_path text);
CREATE TABLE public.properties(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),landlord_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,title text,address text,city text,type text,rent numeric,bedrooms integer,bathrooms integer,area numeric,status text NOT NULL DEFAULT 'vacant',created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.applications(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE RESTRICT,tenant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,status text NOT NULL DEFAULT 'pending' CHECK(status IN('pending','approved','rejected')),created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.favorites(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE RESTRICT,user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.conversations(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid REFERENCES auth.users(id) ON DELETE RESTRICT,tenant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,landlord_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE RESTRICT,participant_name text,participant_role text,last_message_at timestamptz);
CREATE TABLE public.messages(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE RESTRICT,sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,body text NOT NULL,created_at timestamptz NOT NULL DEFAULT clock_timestamp(),attachment_path text,attachment_name text,attachment_type text);
CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean NOT NULL,file_size_limit bigint,allowed_mime_types text[]);
CREATE TABLE storage.objects(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),bucket_id text NOT NULL REFERENCES storage.buckets(id),name text NOT NULL,owner_id text,metadata jsonb NOT NULL DEFAULT '{}',UNIQUE(bucket_id,name));
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
GRANT INSERT ON storage.objects TO authenticated;
-- Owner setup models Storage metadata inserts only; no bytes or Storage HTTP API.
INSERT INTO storage.buckets VALUES('cnic-documents','cnic-documents',false,10485760,ARRAY['image/jpeg','image/png']);
