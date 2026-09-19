import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getMeasurementHistory(clientId: string, limit = 30) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("measurements")
    .select("id, recorded_at, weight_kg, waist_cm, chest_cm, arm_cm, thigh_cm")
    .eq("client_id", clientId)
    .order("recorded_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getActivityHistory(clientId: string, limit = 30) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_logs")
    .select("id, recorded_at, walking_km, running_km, steps, is_active_day")
    .eq("client_id", clientId)
    .order("recorded_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getCheckinHistory(clientId: string, limit = 14) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_checkins")
    .select("*")
    .eq("client_id", clientId)
    .order("checkin_date", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getTodayCheckin(clientId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("daily_checkins")
    .select("*")
    .eq("client_id", clientId)
    .eq("checkin_date", today)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * "Needs attention" status per spec section 18. Thresholds are
 * constants here (not hardcoded across the UI) so they can be made
 * admin-configurable later without touching call sites.
 */
export const ATTENTION_THRESHOLDS = {
  noCheckinDays: 5,
  noWorkoutDays: 7,
};

export function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diffMs = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export type AttentionLevel = "green" | "yellow" | "red";

export function attentionLevel(lastCheckinDate: string | null): AttentionLevel {
  const since = daysSince(lastCheckinDate);
  if (since === null) return "red";
  if (since >= ATTENTION_THRESHOLDS.noCheckinDays) return "red";
  if (since >= Math.ceil(ATTENTION_THRESHOLDS.noCheckinDays / 2)) return "yellow";
  return "green";
}
