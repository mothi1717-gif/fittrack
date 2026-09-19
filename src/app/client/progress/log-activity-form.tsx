"use client";

import { useActionState } from "react";
import { logActivity, type FormState } from "@/lib/actions/progress";

const initialState: FormState = { error: null };
const inputClass =
  "rounded-md border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-neutral-900";

export function LogActivityForm() {
  const [state, formAction, pending] = useActionState(logActivity, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        <input name="walking_km" type="number" step="0.1" placeholder="Walk (km)" className={inputClass} />
        <input name="running_km" type="number" step="0.1" placeholder="Run (km)" className={inputClass} />
        <input name="steps" type="number" placeholder="Steps" className={inputClass} />
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
