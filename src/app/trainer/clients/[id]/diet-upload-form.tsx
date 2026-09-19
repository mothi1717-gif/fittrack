"use client";

import { useActionState } from "react";
import { uploadDietPlan, type DietFormState } from "@/lib/actions/diet";

const initialState: DietFormState = { error: null };
const inputClass =
  "w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-neutral-900";

export function DietUploadForm({ clientId }: { clientId: string }) {
  const [state, formAction, pending] = useActionState(uploadDietPlan, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="client_id" value={clientId} />
      <input name="title" placeholder="Diet plan title" required className={inputClass} />
      <input name="pdf" type="file" accept="application/pdf" required className={inputClass} />
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Uploading..." : "Upload diet PDF"}
      </button>
    </form>
  );
}
