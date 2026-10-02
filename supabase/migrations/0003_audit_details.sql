-- Exports have to be recorded with the filters they used, and audit_log has no
-- room for that. One nullable jsonb column keeps the existing rows valid and
-- lets any future action attach its own context.
-- It must never hold an NNI, a phone number or a password.

alter table public.audit_log
  add column details jsonb;
