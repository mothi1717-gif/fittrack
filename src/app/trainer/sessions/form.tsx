"use client";

import { useActionState } from "react";
import { createSession, type FormState } from "@/lib/actions/sessions";

const initialState: FormState = { error: null };
const inputClass =
  "w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-neutral-900";

export function NewSessionForm({ clients }: { clients: { id: string; fullName: string }[] }) {
  const [state, formAction, pending] = useActionState(createSession, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <select name="client_id" required defaultValue="" className={inputClass}>
        <option value="" disabled>Select client</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>{c.fullName}</option>
        ))}
      </select>
      <input name="title" placeholder="Session title" required className={inputClass} />
      <input name="scheduled_at" type="datetime-local" required className={inputClass} />
      <input name="meet_link" placeholder="Google Meet link (optional)" className={inputClass} />
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Scheduling..." : "Schedule session"}
      </button>
    </form>
  );
}
