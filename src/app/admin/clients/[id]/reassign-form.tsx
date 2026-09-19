"use client";

import { useTransition } from "react";
import { reassignClient } from "@/lib/actions/admin";

export function ReassignForm({
  clientId,
  trainers,
}: {
  clientId: string;
  trainers: { id: string; fullName: string }[];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="flex gap-2"
      action={(formData: FormData) => {
        const trainerId = String(formData.get("trainer_id") ?? "");
        if (!trainerId) return;
        startTransition(() => reassignClient(clientId, trainerId));
      }}
    >
      <select
        name="trainer_id"
        required
        className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
        defaultValue=""
      >
        <option value="" disabled>Choose a trainer</option>
        {trainers.map((t) => (
          <option key={t.id} value={t.id}>{t.fullName}</option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Assigning..." : "Assign"}
      </button>
    </form>
  );
}
