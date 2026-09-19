"use client";

import { useActionState } from "react";
import { createTrainer, type FormState } from "@/lib/actions/admin";

const initialState: FormState = { error: null };
const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900";
const labelClass = "mb-1 block text-sm font-medium text-neutral-700";

export default function NewTrainerPage() {
  const [state, formAction, pending] = useActionState(createTrainer, initialState);

  return (
    <div className="mx-auto max-w-lg px-6 py-8">
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">New Trainer</h1>
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
            Share this with the trainer directly — they can change it after logging in.
          </p>
        </div>
        <div>
          <label className={labelClass} htmlFor="bio">Bio (optional)</label>
          <textarea id="bio" name="bio" rows={3} className={inputClass} />
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Creating..." : "Create trainer"}
        </button>
      </form>
    </div>
  );
}
