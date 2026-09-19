import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function listClients() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select(
      `id, goal, starting_weight_kg,
       profile:profiles!clients_id_fkey ( full_name, email, is_active, created_at ),
       assignment:trainer_client_assignments!trainer_client_assignments_client_id_fkey (
         trainer_id, ended_at,
         trainer:profiles!trainer_client_assignments_trainer_id_fkey ( full_name )
       )`
    )
    .order("id");

  if (error) throw error;

  return (data ?? []).map((c: any) => ({
    id: c.id,
    fullName: c.profile?.full_name ?? "—",
    email: c.profile?.email ?? "—",
    isActive: c.profile?.is_active ?? false,
    goal: c.goal,
    trainerName:
      c.assignment?.find((a: any) => a.ended_at === null)?.trainer?.full_name ?? null,
  }));
}

export async function listTrainers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trainers")
    .select(
      `id, bio,
       profile:profiles!trainers_id_fkey ( full_name, email, is_active ),
       assignments:trainer_client_assignments!trainer_client_assignments_trainer_id_fkey ( client_id, ended_at )`
    )
    .order("id");

  if (error) throw error;

  return (data ?? []).map((t: any) => ({
    id: t.id,
    fullName: t.profile?.full_name ?? "—",
    email: t.profile?.email ?? "—",
    isActive: t.profile?.is_active ?? false,
    activeClientCount: (t.assignments ?? []).filter((a: any) => a.ended_at === null).length,
  }));
}

export async function getActiveTrainerOptions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trainers")
    .select("id, profile:profiles!trainers_id_fkey ( full_name, is_active )")
    .order("id");

  if (error) throw error;

  return (data ?? [])
    .filter((t: any) => t.profile?.is_active)
    .map((t: any) => ({ id: t.id, fullName: t.profile?.full_name ?? "—" }));
}

export async function getClientDetail(clientId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select(
      `id, goal, activity_level, sex, date_of_birth, height_cm, starting_weight_kg,
       profile:profiles!clients_id_fkey ( full_name, email, phone, is_active, created_at ),
       assignments:trainer_client_assignments!trainer_client_assignments_client_id_fkey (
         id, trainer_id, assigned_at, ended_at,
         trainer:profiles!trainer_client_assignments_trainer_id_fkey ( full_name )
       )`
    )
    .eq("id", clientId)
    .single();

  if (error) throw error;
  return data as any;
}

export async function getTrainerDetail(trainerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trainers")
    .select(
      `id, bio,
       profile:profiles!trainers_id_fkey ( full_name, email, is_active, created_at ),
       assignments:trainer_client_assignments!trainer_client_assignments_trainer_id_fkey (
         client_id, ended_at,
         client:profiles!clients_id_fkey ( full_name )
       )`
    )
    .eq("id", trainerId)
    .single();

  if (error) throw error;
  return data as any;
}
