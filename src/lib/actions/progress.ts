"use server";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface FormState {
  error: string | null;
}

export async function logMeasurement(_prev: FormState, formData: FormData): Promise<FormState> {
  const client = await requireRole("client");
  const supabase = await createClient();

  const weightKg = Number(formData.get("weight_kg") ?? "") || null;
  const waistCm = Number(formData.get("waist_cm") ?? "") || null;
  const chestCm = Number(formData.get("chest_cm") ?? "") || null;
  const armCm = Number(formData.get("arm_cm") ?? "") || null;
  const thighCm = Number(formData.get("thigh_cm") ?? "") || null;

  if (!weightKg && !waistCm && !chestCm && !armCm && !thighCm) {
    return { error: "Enter at least one measurement." };
  }

  const { error } = await supabase.from("measurements").insert({
    client_id: client.id,
    weight_kg: weightKg,
    waist_cm: waistCm,
    chest_cm: chestCm,
    arm_cm: armCm,
    thigh_cm: thighCm,
  });

  if (error) return { error: error.message };

  revalidatePath("/client/progress");
  return { error: null };
}

export async function logActivity(_prev: FormState, formData: FormData): Promise<FormState> {
  const client = await requireRole("client");
  const supabase = await createClient();

  const walkingKm = Number(formData.get("walking_km") ?? "") || null;
  const runningKm = Number(formData.get("running_km") ?? "") || null;
  const steps = Number(formData.get("steps") ?? "") || null;

  const { error } = await supabase.from("activity_logs").insert({
    client_id: client.id,
    walking_km: walkingKm,
    running_km: runningKm,
    steps,
    is_active_day: true,
  });

  if (error) return { error: error.message };

  revalidatePath("/client/progress");
  return { error: null };
}

export async function submitCheckin(_prev: FormState, formData: FormData): Promise<FormState> {
  const client = await requireRole("client");
  const supabase = await createClient();

  const today = new Date().toISOString().slice(0, 10);

  const { error } = await supabase.from("daily_checkins").upsert(
    {
      client_id: client.id,
      checkin_date: today,
      workout_status: (String(formData.get("workout_status") ?? "") || null) as any,
      diet_status: (String(formData.get("diet_status") ?? "") || null) as any,
      steps: Number(formData.get("steps") ?? "") || null,
      sleep_hours: Number(formData.get("sleep_hours") ?? "") || null,
      energy: (String(formData.get("energy") ?? "") || null) as any,
      notes: String(formData.get("notes") ?? "").trim() || null,
    },
    { onConflict: "client_id,checkin_date" }
  );

  if (error) return { error: error.message };

  revalidatePath("/client/home");
  revalidatePath("/client/progress");
  return { error: null };
}
