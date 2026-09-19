"use client";

import { useActionState } from "react";
import { submitCheckin, type FormState } from "@/lib/actions/progress";

const initialState: FormState = { error: null };
const selectClass =
  "w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-neutral-900";

export function CheckinForm() {
  const [state, formAction, pending] = useActionState(submitCheckin, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <select name="workout_status" className={selectClass} defaultValue="">
          <option value="" disabled>Workout</option>
          <option value="completed">Completed</option>
          <option value="skipped">Skipped</option>
        </select>
        <select name="diet_status" className={selectClass} defaultValue="">
          <option value="" disabled>Diet</option>
          <option value="followed">Followed</option>
          <option value="partial">Partially</option>
          <option value="not_followed">Not followed</option>
        </select>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <input name="steps" type="number" placeholder="Steps" className={selectClass} />
        <input name="sleep_hours" type="number" step="0.5" placeholder="Sleep (h)" className={selectClass} />
        <select name="energy" className={selectClass} defaultValue="">
          <option value="" disabled>Energy</option>
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="good">Good</option>
        </select>
      </div>
      <input name="notes" placeholder="Notes (optional)" className={selectClass} />
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Submitting..." : "Submit check-in"}
      </button>
    </form>
  );
}
