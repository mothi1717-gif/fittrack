import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function listMyClients(trainerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trainer_client_assignments")
    .select(
      `client_id,
       client:clients!trainer_client_assignments_client_id_fkey (
         id, goal,
         profile:profiles!clients_id_fkey ( full_name, is_active )
       )`
    )
    .eq("trainer_id", trainerId)
    .is("ended_at", null);

  if (error) throw error;

  const clientIds = (data ?? []).map((a: any) => a.client_id);

  const [{ data: latestMeasurements }, { data: latestCheckins }] = await Promise.all([
    supabase
      .from("measurements")
      .select("client_id, weight_kg, recorded_at")
      .in("client_id", clientIds.length ? clientIds : ["00000000-0000-0000-0000-000000000000"])
      .order("recorded_at", { ascending: false }),
    supabase
      .from("daily_checkins")
      .select("client_id, checkin_date")
      .in("client_id", clientIds.length ? clientIds : ["00000000-0000-0000-0000-000000000000"])
      .order("checkin_date", { ascending: false }),
  ]);

  const latestWeightByClient = new Map<string, number>();
  for (const m of latestMeasurements ?? []) {
    if (!latestWeightByClient.has(m.client_id) && m.weight_kg) {
      latestWeightByClient.set(m.client_id, m.weight_kg);
    }
  }

  const latestCheckinByClient = new Map<string, string>();
  for (const c of latestCheckins ?? []) {
    if (!latestCheckinByClient.has(c.client_id)) {
      latestCheckinByClient.set(c.client_id, c.checkin_date);
    }
  }

  return (data ?? []).map((a: any) => ({
    id: a.client_id,
    fullName: a.client?.profile?.full_name ?? "—",
    goal: a.client?.goal ?? null,
    latestWeightKg: latestWeightByClient.get(a.client_id) ?? null,
    lastCheckin: latestCheckinByClient.get(a.client_id) ?? null,
  }));
}

export async function getClientForTrainer(clientId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select(
      `id, goal, activity_level, sex, height_cm, starting_weight_kg,
       profile:profiles!clients_id_fkey ( full_name, email, is_active )`
    )
    .eq("id", clientId)
    .single();

  if (error) throw error;
  return data as any;
}
