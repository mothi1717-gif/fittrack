"use client";

import { useActionState } from "react";
import { updateMyProfile, type FormState } from "@/lib/actions/client";

const initialState: FormState = { error: null };
const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900";
const labelClass = "mb-1 block text-sm font-medium text-neutral-700";

export function ProfileForm({ clientRecord }: { clientRecord: any }) {
  const [state, formAction, pending] = useActionState(updateMyProfile, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className={labelClass} htmlFor="date_of_birth">Date of birth</label>
        <input
          id="date_of_birth"
          name="date_of_birth"
          type="date"
          required
          defaultValue={clientRecord?.date_of_birth ?? ""}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="sex">Sex</label>
          <select id="sex" name="sex" required defaultValue={clientRecord?.sex ?? ""} className={inputClass}>
            <option value="" disabled>Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="height_cm">Height (cm)</label>
          <input
            id="height_cm"
            name="height_cm"
            type="number"
            step="0.1"
            required
            defaultValue={clientRecord?.height_cm ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="weight_kg">Current weight (kg)</label>
        <input id="weight_kg" name="weight_kg" type="number" step="0.1" required className={inputClass} />
        <p className="mt-1 text-xs text-neutral-400">Logging a new weight adds a progress entry too.</p>
      </div>

      <div>
        <label className={labelClass} htmlFor="goal">Goal</label>
        <select id="goal" name="goal" required defaultValue={clientRecord?.goal ?? ""} className={inputClass}>
          <option value="" disabled>Select</option>
          <option value="fat_loss">Fat loss</option>
          <option value="muscle_gain">Muscle gain</option>
          <option value="maintenance">Maintenance</option>
          <option value="general_fitness">General fitness</option>
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor="activity_level">Activity level</label>
        <select
          id="activity_level"
          name="activity_level"
          required
          defaultValue={clientRecord?.activity_level ?? ""}
          className={inputClass}
        >
          <option value="" disabled>Select</option>
          <option value="sedentary">Sedentary (little/no exercise)</option>
          <option value="light">Light (1-3 days/week)</option>
          <option value="moderate">Moderate (3-5 days/week)</option>
          <option value="active">Active (6-7 days/week)</option>
          <option value="very_active">Very active (physical job/2x training)</option>
        </select>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}
