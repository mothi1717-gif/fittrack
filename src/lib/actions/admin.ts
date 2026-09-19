"use server";

import { requireRole } from "@/lib/auth/require-role";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ActivityLevel, Goal, Sex } from "@/lib/calorie/calculate";

async function logAudit(
  action: string,
  targetTable: string,
  targetId: string,
  details?: Record<string, unknown>
) {
  const admin = createAdminClient();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await admin.from("audit_logs").insert({
    actor_id: user?.id ?? null,
    action,
    target_table: targetTable,
    target_id: targetId,
    details: details ?? null,
  });
}

export interface FormState {
  error: string | null;
}

export async function createTrainer(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireRole("admin");

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const bio = String(formData.get("bio") ?? "").trim();

  if (!fullName || !email || password.length < 8) {
    return { error: "Full name, email, and an 8+ character password are required." };
  }

  const admin = createAdminClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError || !created.user) {
    return { error: createError?.message ?? "Could not create the trainer account." };
  }

  const userId = created.user.id;

  const { error: profileError } = await admin
    .from("profiles")
    .insert({ id: userId, role: "trainer", full_name: fullName, email });

  if (profileError) {
    await admin.auth.admin.deleteUser(userId);
    return { error: profileError.message };
  }

  await admin.from("trainers").insert({ id: userId, bio: bio || null });
  await logAudit("create_trainer", "trainers", userId, { email });

  revalidatePath("/admin/trainers");
  redirect("/admin/trainers");
}

export async function createClientAccount(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin_profile = await requireRole("admin");

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const goal = String(formData.get("goal") ?? "") as Goal;
  const activityLevel = String(formData.get("activity_level") ?? "") as ActivityLevel;
  const sex = String(formData.get("sex") ?? "") as Sex;
  const heightCm = Number(formData.get("height_cm") ?? 0) || null;
  const startingWeightKg = Number(formData.get("starting_weight_kg") ?? 0) || null;
  const trainerId = String(formData.get("trainer_id") ?? "") || null;

  if (!fullName || !email || password.length < 8) {
    return { error: "Full name, email, and an 8+ character password are required." };
  }

  const admin = createAdminClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError || !created.user) {
    return { error: createError?.message ?? "Could not create the client account." };
  }

  const userId = created.user.id;

  const { error: profileError } = await admin
    .from("profiles")
    .insert({ id: userId, role: "client", full_name: fullName, email });

  if (profileError) {
    await admin.auth.admin.deleteUser(userId);
    return { error: profileError.message };
  }

  await admin.from("clients").insert({
    id: userId,
    goal: goal || null,
    activity_level: activityLevel || null,
    sex: sex || null,
    height_cm: heightCm,
    starting_weight_kg: startingWeightKg,
    created_by: admin_profile.id,
  });

  if (trainerId) {
    await admin.from("trainer_client_assignments").insert({
      client_id: userId,
      trainer_id: trainerId,
      assigned_by: admin_profile.id,
    });
  }

  await logAudit("create_client", "clients", userId, { email, trainerId });

  revalidatePath("/admin/clients");
  redirect("/admin/clients");
}

export async function reassignClient(clientId: string, newTrainerId: string) {
  const profile = await requireRole("admin");
  const admin = createAdminClient();

  // Close the currently active assignment, if any.
  await admin
    .from("trainer_client_assignments")
    .update({ ended_at: new Date().toISOString() })
    .eq("client_id", clientId)
    .is("ended_at", null);

  const { error } = await admin.from("trainer_client_assignments").insert({
    client_id: clientId,
    trainer_id: newTrainerId,
    assigned_by: profile.id,
  });

  if (error) throw error;

  await logAudit("reassign_client", "clients", clientId, { newTrainerId });
  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/admin/clients");
}

export async function reassignAllClients(fromTrainerId: string, toTrainerId: string) {
  const profile = await requireRole("admin");
  const admin = createAdminClient();

  const { data: activeAssignments, error: fetchError } = await admin
    .from("trainer_client_assignments")
    .select("client_id")
    .eq("trainer_id", fromTrainerId)
    .is("ended_at", null);

  if (fetchError) throw fetchError;

  const now = new Date().toISOString();
  for (const a of activeAssignments ?? []) {
    await admin
      .from("trainer_client_assignments")
      .update({ ended_at: now })
      .eq("client_id", a.client_id)
      .is("ended_at", null);

    await admin.from("trainer_client_assignments").insert({
      client_id: a.client_id,
      trainer_id: toTrainerId,
      assigned_by: profile.id,
    });
  }

  await logAudit("reassign_all_clients", "trainers", fromTrainerId, {
    toTrainerId,
    count: activeAssignments?.length ?? 0,
  });

  revalidatePath(`/admin/trainers/${fromTrainerId}`);
  revalidatePath("/admin/trainers");
  revalidatePath("/admin/clients");
}

export async function setTrainerActive(trainerId: string, isActive: boolean) {
  await requireRole("admin");
  const admin = createAdminClient();

  const { error } = await admin.from("profiles").update({ is_active: isActive }).eq("id", trainerId);
  if (error) throw error;

  await logAudit(isActive ? "activate_trainer" : "deactivate_trainer", "trainers", trainerId);
  revalidatePath(`/admin/trainers/${trainerId}`);
  revalidatePath("/admin/trainers");
}

export async function setClientActive(clientId: string, isActive: boolean) {
  await requireRole("admin");
  const admin = createAdminClient();

  const { error } = await admin.from("profiles").update({ is_active: isActive }).eq("id", clientId);
  if (error) throw error;

  await logAudit(isActive ? "activate_client" : "deactivate_client", "clients", clientId);
  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/admin/clients");
}
