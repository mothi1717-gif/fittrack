import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getUpcomingSessionsForClient(clientId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("id, title, scheduled_at, status, meet_link, notes")
    .eq("client_id", clientId)
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getSessionsForTrainer(trainerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select(
      "id, title, scheduled_at, status, meet_link, client_id, client:clients!sessions_client_id_fkey ( profile:profiles!clients_id_fkey ( full_name ) )"
    )
    .eq("trainer_id", trainerId)
    .order("scheduled_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as any[];
}
