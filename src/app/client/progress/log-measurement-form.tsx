"use client";

import { useActionState } from "react";
import { logMeasurement, type FormState } from "@/lib/actions/progress";

const initialState: FormState = { error: null };
const inputClass =
  "rounded-md border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-neutral-900";

export function LogMeasurementForm() {
  const [state, formAction, pending] = useActionState(logMeasurement, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <input name="weight_kg" type="number" step="0.1" placeholder="Weight (kg)" className={inputClass} />
        <input name="waist_cm" type="number" step="0.1" placeholder="Waist (cm)" className={inputClass} />
        <input name="chest_cm" type="number" step="0.1" placeholder="Chest (cm)" className={inputClass} />
        <input name="arm_cm" type="number" step="0.1" placeholder="Arm (cm)" className={inputClass} />
        <input name="thigh_cm" type="number" step="0.1" placeholder="Thigh (cm)" className={inputClass} />
      </div>
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
