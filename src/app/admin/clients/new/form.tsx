"use client";

import { useActionState } from "react";
import { createClientAccount, type FormState } from "@/lib/actions/admin";

const initialState: FormState = { error: null };

const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900";
const labelClass = "mb-1 block text-sm font-medium text-neutral-700";

export function NewClientForm({ trainers }: { trainers: { id: string; fullName: string }[] }) {
  const [state, formAction, pending] = useActionState(createClientAccount, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className={labelClass} htmlFor="full_name">Full name</label>
        <input id="full_name" name="full_name" required className={inputClass} />
      </div>

      <div>
        <label className={labelClass} htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required className={inputClass} />
      </div>

      <div>
        <label className={labelClass} htmlFor="password">Temporary password</label>
        <input id="password" name="password" type="text" minLength={8} required className={inputClass} />
        <p className="mt-1 text-xs text-neutral-400">
          Share this with the client directly — they can change it after logging in.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="sex">Sex</label>
          <select id="sex" name="sex" className={inputClass} defaultValue="">
            <option value="" disabled>Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="height_cm">Height (cm)</label>
          <input id="height_cm" name="height_cm" type="number" step="0.1" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="starting_weight_kg">Starting weight (kg)</label>
          <input id="starting_weight_kg" name="starting_weight_kg" type="number" step="0.1" className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="goal">Goal</label>
          <select id="goal" name="goal" className={inputClass} defaultValue="">
            <option value="" disabled>Select</option>
            <option value="fat_loss">Fat loss</option>
            <option value="muscle_gain">Muscle gain</option>
            <option value="maintenance">Maintenance</option>
            <option value="general_fitness">General fitness</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="activity_level">Activity level</label>
        <select id="activity_level" name="activity_level" className={inputClass} defaultValue="">
          <option value="" disabled>Select</option>
          <option value="sedentary">Sedentary</option>
          <option value="light">Light</option>
          <option value="moderate">Moderate</option>
          <option value="active">Active</option>
          <option value="very_active">Very active</option>
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor="trainer_id">Assign trainer (optional)</label>
        <select id="trainer_id" name="trainer_id" className={inputClass} defaultValue="">
          <option value="">Unassigned</option>
          {trainers.map((t) => (
            <option key={t.id} value={t.id}>{t.fullName}</option>
          ))}
        </select>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Creating..." : "Create client"}
      </button>
    </form>
  );
}
