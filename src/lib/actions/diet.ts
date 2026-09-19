"use server";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface DietFormState {
  error: string | null;
}

export async function uploadDietPlan(
  _prev: DietFormState,
  formData: FormData
): Promise<DietFormState> {
  const trainer = await requireRole("trainer");
  const supabase = await createClient();

  const clientId = String(formData.get("client_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const file = formData.get("pdf") as File | null;

  if (!clientId || !title) {
    return { error: "Title is required." };
  }
  if (!file || file.size === 0) {
    return { error: "Choose a PDF to upload." };
  }
  if (file.type !== "application/pdf") {
    return { error: "Only PDF files are supported for Level 1." };
  }

  // One active plan per client: deactivate the old one, keep it in history.
  await supabase
    .from("diet_plans")
    .update({ is_active: false })
    .eq("client_id", clientId)
    .eq("is_active", true);

  const path = `${clientId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("diet-pdfs")
    .upload(path, file, { contentType: "application/pdf" });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { error: insertError } = await supabase.from("diet_plans").insert({
    client_id: clientId,
    trainer_id: trainer.id,
    title,
    pdf_storage_path: path,
  });

  if (insertError) {
    return { error: insertError.message };
  }

  revalidatePath(`/trainer/clients/${clientId}`);
  revalidatePath("/client/diet");
  return { error: null };
}
