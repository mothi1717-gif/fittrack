"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface FormState {
  error: string | null;
}

async function requireClientOrTrainer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "client" && profile.role !== "trainer")) {
    throw new Error("Not authorized");
  }
  return profile;
}

export async function sendMessage(
  clientId: string,
  trainerId: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const sender = await requireClientOrTrainer();
  const supabase = await createClient();

  const body = String(formData.get("body") ?? "").trim();
  const file = formData.get("attachment") as File | null;

  if (!body && (!file || file.size === 0)) {
    return { error: "Write a message or attach a file." };
  }

  const { data: message, error } = await supabase
    .from("messages")
    .insert({ client_id: clientId, trainer_id: trainerId, sender_id: sender.id, body: body || null })
    .select("id")
    .single();

  if (error) return { error: error.message };

  if (file && file.size > 0) {
    const path = `${clientId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("message-attachments")
      .upload(path, file);

    if (uploadError) return { error: uploadError.message };

    await supabase.from("message_attachments").insert({
      message_id: message.id,
      storage_path: path,
      file_type: file.type,
    });
  }

  revalidatePath(`/trainer/clients/${clientId}/messages`);
  revalidatePath("/client/messages");
  return { error: null };
}
