"use client";

import { useTransition } from "react";
import { reassignAllClients } from "@/lib/actions/admin";

export function BulkReassignForm({
  fromTrainerId,
  trainers,
}: {
  fromTrainerId: string;
  trainers: { id: string; fullName: string }[];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="flex gap-2"
      action={(formData: FormData) => {
        const toTrainerId = String(formData.get("to_trainer_id") ?? "");
        if (!toTrainerId) return;
        startTransition(() => reassignAllClients(fromTrainerId, toTrainerId));
      }}
    >
      <select
        name="to_trainer_id"
        required
        defaultValue=""
        className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
      >
        <option value="" disabled>Reassign all clients to...</option>
        {trainers.map((t) => (
          <option key={t.id} value={t.id}>{t.fullName}</option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Reassigning..." : "Reassign Clients"}
      </button>
    </form>
  );
}
