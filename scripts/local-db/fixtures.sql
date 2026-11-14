-- Privileged setup only: deterministic fictional users/properties. Not actor tests.
INSERT INTO auth.users(id,raw_user_meta_data) VALUES
('10000000-0000-4000-8000-000000000001','{"full_name":"Fictional Tenant A","role":"tenant"}'),
('10000000-0000-4000-8000-000000000002','{"full_name":"Fictional Tenant B","role":"tenant"}'),
('20000000-0000-4000-8000-000000000001','{"full_name":"Fictional Landlord A","role":"landlord"}'),
('20000000-0000-4000-8000-000000000002','{"full_name":"Fictional Landlord B","role":"landlord"}'),
('50000000-0000-4000-8000-000000000001','{"full_name":"Fictional Administrator","role":"admin","trust_score":100}');
-- Only the trusted setup owner may promote the fictional staff account.
UPDATE public.profiles SET role='admin' WHERE id='50000000-0000-4000-8000-000000000001';
INSERT INTO public.properties(id,landlord_id,title,address,city,type,rent,bedrooms,bathrooms,area) SELECT
('30000000-0000-4000-8000-'||lpad(i::text,12,'0'))::uuid,
CASE WHEN i=2 THEN '20000000-0000-4000-8000-000000000002'::uuid ELSE '20000000-0000-4000-8000-000000000001'::uuid END,
'Fictional property '||i,'Synthetic address','Karachi','House',30000,2,1,800 FROM generate_series(1,12) i;
