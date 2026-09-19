import { requireRole } from "@/lib/auth/require-role";
import { getActiveWorkoutPlan, getExerciseHistory } from "@/lib/data/workouts";
import { ExerciseCard } from "./exercise-card";

export default async function ClientWorkoutPage() {
  const profile = await requireRole("client");
  const plan = await getActiveWorkoutPlan(profile.id);

  if (!plan) {
    return (
      <div className="px-4 py-6">
        <h1 className="mb-4 text-lg font-semibold text-neutral-900">Workout</h1>
        <p className="text-sm text-neutral-500">No workout plan assigned yet.</p>
      </div>
    );
  }

  const days = [...(plan.days ?? [])].sort((a: any, b: any) => a.day_order - b.day_order);

  const historiesByExercise = new Map<string, any[]>();
  for (const day of days) {
    for (const ex of day.exercises ?? []) {
      historiesByExercise.set(ex.id, await getExerciseHistory(profile.id, ex.id));
    }
  }

  return (
    <div className="px-4 py-6">
      <h1 className="mb-1 text-lg font-semibold text-neutral-900">{plan.title}</h1>
      <p className="mb-4 text-sm text-neutral-500">{days.length} day{days.length === 1 ? "" : "s"}</p>

      {days.map((day: any) => (
        <div key={day.id} className="mb-6">
          <h2 className="mb-2 text-sm font-semibold text-neutral-700">{day.title}</h2>
          <div className="space-y-3">
            {(day.exercises ?? [])
              .sort((a: any, b: any) => a.exercise_order - b.exercise_order)
              .map((ex: any) => (
                <ExerciseCard key={ex.id} exercise={ex} history={historiesByExercise.get(ex.id) ?? []} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
