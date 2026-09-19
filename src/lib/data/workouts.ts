import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getActiveWorkoutPlan(clientId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workout_plans")
    .select(
      `id, title, client_id, trainer_id,
       days:workout_days (
         id, title, day_order,
         exercises:workout_exercises ( id, name, target_sets, target_reps, target_weight_kg, exercise_order )
       )`
    )
    .eq("client_id", clientId)
    .eq("is_active", true)
    .order("day_order", { foreignTable: "workout_days", ascending: true })
    .maybeSingle();

  if (error) throw error;
  return data as any;
}

export async function getExerciseHistory(clientId: string, workoutExerciseId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workout_logs")
    .select("id, logged_at, sets:workout_sets ( set_number, weight_kg, reps )")
    .eq("client_id", clientId)
    .eq("workout_exercise_id", workoutExerciseId)
    .order("logged_at", { ascending: false })
    .limit(10);

  if (error) throw error;
  return (data ?? []) as any[];
}

export async function getBestOneRepMax(clientId: string, workoutExerciseId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("personal_records")
    .select("estimated_one_rm")
    .eq("client_id", clientId)
    .eq("workout_exercise_id", workoutExerciseId)
    .order("estimated_one_rm", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.estimated_one_rm ?? null;
}
