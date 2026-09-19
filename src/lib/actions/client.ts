"use server";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface FormState {
  error: string | null;
}

export async function updateMyProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const client = await requireRole("client");
  const supabase = await createClient();

  const dateOfBirth = String(formData.get("date_of_birth") ?? "") || null;
  const sex = String(formData.get("sex") ?? "") || null;
  const heightCm = Number(formData.get("height_cm") ?? "") || null;
  const weightKg = Number(formData.get("weight_kg") ?? "") || null;
  const goal = String(formData.get("goal") ?? "") || null;
  const activityLevel = String(formData.get("activity_level") ?? "") || null;

  if (!dateOfBirth || !sex || !heightCm || !weightKg || !goal || !activityLevel) {
    return { error: "Fill in every field to see your calorie estimate." };
  }

  const { error: clientError } = await supabase
    .from("clients")
    .update({
      date_of_birth: dateOfBirth,
      sex: sex as any,
      height_cm: heightCm,
      goal: goal as any,
      activity_level: activityLevel as any,
    })
    .eq("id", client.id);

  if (clientError) return { error: clientError.message };

  const { error: measurementError } = await supabase
    .from("measurements")
    .insert({ client_id: client.id, weight_kg: weightKg });

  if (measurementError) return { error: measurementError.message };

  revalidatePath("/client/home");
  revalidatePath("/client/profile");
  return { error: null };
}
