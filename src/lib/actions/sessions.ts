"use server";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface FormState {
  error: string | null;
}

export async function createSession(_prev: FormState, formData: FormData): Promise<FormState> {
  const trainer = await requireRole("trainer");
  const supabase = await createClient();

  const clientId = String(formData.get("client_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const scheduledAt = String(formData.get("scheduled_at") ?? "");
  const meetLink = String(formData.get("meet_link") ?? "").trim();

  if (!clientId || !title || !scheduledAt) {
    return { error: "Client, title, and date/time are required." };
  }

  const { error } = await supabase.from("sessions").insert({
    client_id: clientId,
    trainer_id: trainer.id,
    title,
    scheduled_at: new Date(scheduledAt).toISOString(),
    meet_link: meetLink || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/trainer/sessions");
  revalidatePath("/client/home");
  return { error: null };
}

export async function updateSessionStatus(sessionId: string, status: "completed" | "cancelled" | "no_show") {
  await requireRole("trainer");
  const supabase = await createClient();

  const { error } = await supabase.from("sessions").update({ status }).eq("id", sessionId);
  if (error) throw error;

  revalidatePath("/trainer/sessions");
}
