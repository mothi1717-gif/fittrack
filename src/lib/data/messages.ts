import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getThread(clientId: string, trainerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("id, sender_id, body, created_at, attachments:message_attachments ( id, storage_path, file_type )")
    .eq("client_id", clientId)
    .eq("trainer_id", trainerId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getSignedAttachmentUrl(storagePath: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("message-attachments")
    .createSignedUrl(storagePath, 60 * 10);

  if (error) throw error;
  return data.signedUrl;
}
