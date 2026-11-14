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
GRANT USAGE ON SCHEMA auth TO anon,authenticated;
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

-- Focused repair fixture contains profiles/auth only, no other domain objects.
