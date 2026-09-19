"use server";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { estimateOneRepMax } from "@/lib/workouts/personal-records";

// ---- Trainer: build/edit the plan ----

export async function createWorkoutPlan(clientId: string, title: string) {
  const trainer = await requireRole("trainer");
  const supabase = await createClient();

  // Deactivate any existing active plan so there's only ever one "today's workout".
  await supabase
    .from("workout_plans")
    .update({ is_active: false })
    .eq("client_id", clientId)
    .eq("is_active", true);

  const { data, error } = await supabase
    .from("workout_plans")
    .insert({ client_id: clientId, trainer_id: trainer.id, title })
    .select("id")
    .single();

  if (error) throw error;

  revalidatePath(`/trainer/clients/${clientId}`);
  return data.id as string;
}

export async function addWorkoutDay(workoutPlanId: string, clientId: string, title: string, dayOrder: number) {
  await requireRole("trainer");
  const supabase = await createClient();

  const { error } = await supabase
    .from("workout_days")
    .insert({ workout_plan_id: workoutPlanId, title, day_order: dayOrder });

  if (error) throw error;
  revalidatePath(`/trainer/clients/${clientId}`);
}

export async function addWorkoutExercise(
  workoutDayId: string,
  clientId: string,
  input: {
    name: string;
    targetSets: number;
    targetReps: string;
    targetWeightKg: number | null;
    exerciseOrder: number;
  }
) {
  await requireRole("trainer");
  const supabase = await createClient();

  const { error } = await supabase.from("workout_exercises").insert({
    workout_day_id: workoutDayId,
    name: input.name,
    target_sets: input.targetSets,
    target_reps: input.targetReps,
    target_weight_kg: input.targetWeightKg,
    exercise_order: input.exerciseOrder,
  });

  if (error) throw error;
  revalidatePath(`/trainer/clients/${clientId}`);
}

// ---- Client: log actual performance ----

export interface LoggedSet {
  weightKg: number;
  reps: number;
}

export async function logWorkoutSets(workoutExerciseId: string, sets: LoggedSet[]) {
  const client = await requireRole("client");
  const supabase = await createClient();

  const { data: log, error: logError } = await supabase
    .from("workout_logs")
    .insert({ client_id: client.id, workout_exercise_id: workoutExerciseId })
    .select("id")
    .single();

  if (logError) throw logError;

  const { data: currentBest } = await supabase
    .from("personal_records")
    .select("estimated_one_rm")
    .eq("client_id", client.id)
    .eq("workout_exercise_id", workoutExerciseId)
    .order("estimated_one_rm", { ascending: false })
    .limit(1)
    .maybeSingle();

  let bestOneRm = currentBest?.estimated_one_rm ?? null;
  let newRecord = false;

  for (let i = 0; i < sets.length; i++) {
    const set = sets[i];
    const { data: insertedSet, error: setError } = await supabase
      .from("workout_sets")
      .insert({
        workout_log_id: log.id,
        set_number: i + 1,
        weight_kg: set.weightKg,
        reps: set.reps,
      })
      .select("id")
      .single();

    if (setError) throw setError;

    const oneRm = estimateOneRepMax({ weightKg: set.weightKg, reps: set.reps });
    if (bestOneRm === null || oneRm > bestOneRm) {
      bestOneRm = oneRm;
      newRecord = true;
      await supabase.from("personal_records").insert({
        client_id: client.id,
        workout_exercise_id: workoutExerciseId,
        workout_set_id: insertedSet.id,
        estimated_one_rm: oneRm,
      });
    }
  }

  revalidatePath("/client/workout");
  return { newRecord };
}
