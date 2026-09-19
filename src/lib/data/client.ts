import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getMyClientRecord(clientId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("id, date_of_birth, sex, height_cm, goal, activity_level, starting_weight_kg")
    .eq("id", clientId)
    .single();

  if (error) throw error;
  return data;
}

export async function getMyActiveTrainer(clientId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trainer_client_assignments")
    .select("trainer_id, trainer:profiles!trainer_client_assignments_trainer_id_fkey ( full_name )")
    .eq("client_id", clientId)
    .is("ended_at", null)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  const row = data as any;
  return { id: row.trainer_id, fullName: row.trainer?.full_name ?? "—" };
}

export async function getLatestWeight(clientId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("measurements")
    .select("weight_kg, recorded_at")
    .eq("client_id", clientId)
    .not("weight_kg", "is", null)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.weight_kg ?? null;
}
