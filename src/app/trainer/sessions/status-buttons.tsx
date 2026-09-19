"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSessionStatus } from "@/lib/actions/sessions";

export function StatusButtons({ sessionId }: { sessionId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function update(status: "completed" | "cancelled" | "no_show") {
    startTransition(async () => {
      await updateSessionStatus(sessionId, status);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-1 text-xs">
      <button disabled={pending} onClick={() => update("completed")} className="rounded-md border border-neutral-300 px-2 py-1">
        Complete
      </button>
      <button disabled={pending} onClick={() => update("cancelled")} className="rounded-md border border-neutral-300 px-2 py-1">
        Cancel
      </button>
    </div>
  );
}
