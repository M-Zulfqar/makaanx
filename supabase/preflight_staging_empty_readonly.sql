-- Run in makaanx-staging ONLY. Read-only safety gate.
-- Expected before bootstrap: zero MakaanX application tables.
select table_name from information_schema.tables
where table_schema='public' and table_type='BASE TABLE'
  and table_name in ('profiles','properties','applications','favorites',
    'conversations','messages','payments','contact_submissions')
order by table_name;

-- Also check whether the identity-upload buckets already exist.
select id,public from storage.buckets
where id in ('cnic-documents','message-attachments')
order by id;
