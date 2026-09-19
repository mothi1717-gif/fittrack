-- Phase 5/8: private storage buckets for diet PDFs and message attachments.
-- Run after 0001_init.sql. Files are stored under a path that starts with
-- the client's UUID (e.g. `<client_id>/plan.pdf`), which these policies
-- use to scope access the same way the table RLS policies do.

insert into storage.buckets (id, name, public)
values ('diet-pdfs', 'diet-pdfs', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('message-attachments', 'message-attachments', false)
on conflict (id) do nothing;

-- diet-pdfs: admin, the client themselves, or their assigned trainer.
create policy "diet_pdfs_select"
  on storage.objects for select
  using (
    bucket_id = 'diet-pdfs'
    and (
      current_role_is('admin')
      or (storage.foldername(name))[1] = auth.uid()::text
      or is_assigned_trainer(((storage.foldername(name))[1])::uuid)
    )
  );

create policy "diet_pdfs_trainer_write"
  on storage.objects for insert
  with check (
    bucket_id = 'diet-pdfs'
    and (
      current_role_is('admin')
      or is_assigned_trainer(((storage.foldername(name))[1])::uuid)
    )
  );

-- message-attachments: same scoping, but either party in the pairing can upload.
create policy "message_attachments_bucket_select"
  on storage.objects for select
  using (
    bucket_id = 'message-attachments'
    and (
      current_role_is('admin')
      or (storage.foldername(name))[1] = auth.uid()::text
      or is_assigned_trainer(((storage.foldername(name))[1])::uuid)
    )
  );

create policy "message_attachments_bucket_write"
  on storage.objects for insert
  with check (
    bucket_id = 'message-attachments'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or is_assigned_trainer(((storage.foldername(name))[1])::uuid)
    )
  );
