import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { listMyClients } from "@/lib/data/trainer";
import { getSessionsForTrainer } from "@/lib/data/sessions";
import { NewSessionForm } from "./form";
import { StatusButtons } from "./status-buttons";

export default async function TrainerSessionsPage() {
  const trainer = await requireRole("trainer");
  const [clients, sessions] = await Promise.all([
    listMyClients(trainer.id),
    getSessionsForTrainer(trainer.id),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <nav className="mb-1 text-xs text-neutral-400">
        <Link href="/trainer/dashboard" className="hover:underline">My Clients</Link> / Sessions
      </nav>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Sessions</h1>

      <div className="mb-6 rounded-lg border border-neutral-200 p-4">
        <h2 className="mb-2 text-sm font-medium text-neutral-900">Schedule a session</h2>
        <NewSessionForm clients={clients.map((c) => ({ id: c.id, fullName: c.fullName }))} />
      </div>

      <div className="space-y-2">
        {sessions.length === 0 && (
          <p className="text-center text-sm text-neutral-400">No sessions scheduled.</p>
        )}
        {sessions.map((s: any) => (
          <div key={s.id} className="flex items-center justify-between rounded-lg border border-neutral-200 p-3">
            <div>
              <p className="text-sm font-medium text-neutral-900">
                {s.title} — {s.client?.profile?.full_name ?? "—"}
              </p>
              <p className="text-xs text-neutral-400">
                {new Date(s.scheduled_at).toLocaleString(undefined, {
                  weekday: "short",
                  hour: "numeric",
                  minute: "2-digit",
                  month: "short",
                  day: "numeric",
                })}{" "}
                · {s.status}
              </p>
            </div>
            {s.status === "scheduled" && <StatusButtons sessionId={s.id} />}
          </div>
        ))}
      </div>
    </div>
  );
}
