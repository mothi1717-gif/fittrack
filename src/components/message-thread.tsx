"use client";

import { useActionState } from "react";
import { sendMessage, type FormState } from "@/lib/actions/messages";

const initialState: FormState = { error: null };

export function MessageThread({
  clientId,
  trainerId,
  currentUserId,
  messages,
}: {
  clientId: string;
  trainerId: string;
  currentUserId: string;
  messages: { id: string; sender_id: string; body: string | null; created_at: string }[];
}) {
  const action = sendMessage.bind(null, clientId, trainerId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <div className="flex h-[70vh] flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto pb-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-neutral-400">No messages yet. Say hello.</p>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === currentUserId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                  mine ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-900"
                }`}
              >
                <p>{m.body}</p>
                <p className={`mt-1 text-[10px] ${mine ? "text-neutral-300" : "text-neutral-400"}`}>
                  {new Date(m.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <form action={formAction} className="flex gap-2 border-t border-neutral-200 pt-3">
        <input
          name="body"
          placeholder="Type a message..."
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
        />
        <input type="file" name="attachment" className="hidden" id="attachment-input" />
        <label
          htmlFor="attachment-input"
          className="flex cursor-pointer items-center rounded-md border border-neutral-300 px-3 text-sm text-neutral-500"
        >
          +
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          Send
        </button>
      </form>
      {state.error && <p className="mt-1 text-xs text-red-600">{state.error}</p>}
    </div>
  );
}
