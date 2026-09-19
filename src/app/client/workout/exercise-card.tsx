"use client";

import { useState, useTransition } from "react";
import { logWorkoutSets, type LoggedSet } from "@/lib/actions/workouts";

export function ExerciseCard({ exercise, history }: { exercise: any; history: any[] }) {
  const [open, setOpen] = useState(false);
  const [sets, setSets] = useState<LoggedSet[]>(
    Array.from({ length: exercise.target_sets }, () => ({
      weightKg: exercise.target_weight_kg ?? 0,
      reps: 0,
    }))
  );
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<"idle" | "saved" | "pr">("idle");

  function updateSet(i: number, field: keyof LoggedSet, value: number) {
    setSets((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  }

  function submit() {
    startTransition(async () => {
      const res = await logWorkoutSets(exercise.id, sets);
      setResult(res.newRecord ? "pr" : "saved");
    });
  }

  return (
    <div className="rounded-lg border border-neutral-200 p-3">
      <button className="w-full text-left" onClick={() => setOpen((o) => !o)}>
        <p className="font-medium text-neutral-900">{exercise.name}</p>
        <p className="text-sm text-neutral-500">
          {exercise.target_sets} sets × {exercise.target_reps}
          {exercise.target_weight_kg ? ` @ ${exercise.target_weight_kg}kg` : ""}
        </p>
      </button>

      {open && (
        <div className="mt-3 space-y-2 border-t border-neutral-100 pt-3">
          {sets.map((set, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="w-12 text-neutral-400">Set {i + 1}</span>
              <input
                type="number"
                step="0.5"
                value={set.weightKg}
                onChange={(e) => updateSet(i, "weightKg", Number(e.target.value))}
                className="w-20 rounded-md border border-neutral-300 px-2 py-1"
                placeholder="kg"
              />
              <span className="text-neutral-400">×</span>
              <input
                type="number"
                value={set.reps}
                onChange={(e) => updateSet(i, "reps", Number(e.target.value))}
                className="w-16 rounded-md border border-neutral-300 px-2 py-1"
                placeholder="reps"
              />
            </div>
          ))}

          <button
            onClick={submit}
            disabled={pending}
            className="mt-2 w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {pending ? "Saving..." : "Log workout"}
          </button>

          {result === "pr" && (
            <p className="text-center text-sm font-semibold text-green-700">New Personal Record</p>
          )}
          {result === "saved" && <p className="text-center text-sm text-neutral-500">Saved</p>}

          {history.length > 0 && (
            <div className="mt-3 border-t border-neutral-100 pt-2">
              <p className="mb-1 text-xs text-neutral-400">Previous performance</p>
              {history.slice(0, 3).map((log: any) => (
                <p key={log.id} className="text-xs text-neutral-500">
                  {new Date(log.logged_at).toLocaleDateString()}:{" "}
                  {(log.sets ?? []).map((s: any) => `${s.weight_kg}kg×${s.reps}`).join(", ")}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
