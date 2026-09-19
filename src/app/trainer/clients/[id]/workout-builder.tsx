"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createWorkoutPlan, addWorkoutDay, addWorkoutExercise } from "@/lib/actions/workouts";

const inputClass =
  "rounded-md border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-neutral-900";

export function WorkoutBuilder({ clientId, plan }: { clientId: string; plan: any }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (!plan) {
    return (
      <form
        className="flex gap-2"
        action={(formData: FormData) => {
          const title = String(formData.get("title") ?? "").trim();
          if (!title) return;
          startTransition(async () => {
            await createWorkoutPlan(clientId, title);
            router.refresh();
          });
        }}
      >
        <input name="title" placeholder="Plan title, e.g. Strength Phase 1" required className={`flex-1 ${inputClass}`} />
        <button type="submit" disabled={pending} className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60">
          {pending ? "Creating..." : "Create Plan"}
        </button>
      </form>
    );
  }

  const days = [...(plan.days ?? [])].sort((a: any, b: any) => a.day_order - b.day_order);

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-neutral-900">{plan.title}</p>

      {days.map((day: any) => (
        <DayCard key={day.id} clientId={clientId} day={day} onChanged={() => router.refresh()} />
      ))}

      <form
        className="flex gap-2"
        action={(formData: FormData) => {
          const title = String(formData.get("day_title") ?? "").trim();
          if (!title) return;
          startTransition(async () => {
            await addWorkoutDay(plan.id, clientId, title, days.length);
            router.refresh();
          });
        }}
      >
        <input name="day_title" placeholder="New day, e.g. Push Day" required className={`flex-1 ${inputClass}`} />
        <button type="submit" disabled={pending} className="rounded-md border border-neutral-300 px-3 py-2 text-sm">
          + Add Day
        </button>
      </form>
    </div>
  );
}

function DayCard({ clientId, day, onChanged }: { clientId: string; day: any; onChanged: () => void }) {
  const [pending, startTransition] = useTransition();
  const exercises = [...(day.exercises ?? [])].sort((a: any, b: any) => a.exercise_order - b.exercise_order);

  return (
    <div className="rounded-lg border border-neutral-200 p-3">
      <p className="mb-2 text-sm font-medium text-neutral-900">{day.title}</p>
      <ul className="mb-2 space-y-1 text-sm text-neutral-600">
        {exercises.map((ex: any) => (
          <li key={ex.id}>
            {ex.name} — {ex.target_sets} × {ex.target_reps}
            {ex.target_weight_kg ? ` @ ${ex.target_weight_kg}kg` : ""}
          </li>
        ))}
        {exercises.length === 0 && <li className="text-neutral-400">No exercises yet.</li>}
      </ul>
      <form
        className="grid grid-cols-4 gap-1"
        action={(formData: FormData) => {
          const name = String(formData.get("name") ?? "").trim();
          const targetSets = Number(formData.get("target_sets") ?? 0);
          const targetReps = String(formData.get("target_reps") ?? "").trim();
          const targetWeightKg = Number(formData.get("target_weight_kg") ?? "") || null;
          if (!name || !targetSets || !targetReps) return;
          startTransition(async () => {
            await addWorkoutExercise(day.id, clientId, {
              name,
              targetSets,
              targetReps,
              targetWeightKg,
              exerciseOrder: exercises.length,
            });
            onChanged();
          });
        }}
      >
        <input name="name" placeholder="Exercise" required className={`col-span-2 ${inputClass}`} />
        <input name="target_sets" type="number" placeholder="Sets" required className={inputClass} />
        <input name="target_reps" placeholder="Reps (8-10)" required className={inputClass} />
        <input name="target_weight_kg" type="number" step="0.5" placeholder="kg (optional)" className={`col-span-3 ${inputClass}`} />
        <button type="submit" disabled={pending} className="rounded-md border border-neutral-300 px-2 py-1.5 text-xs">
          + Add
        </button>
      </form>
    </div>
  );
}
