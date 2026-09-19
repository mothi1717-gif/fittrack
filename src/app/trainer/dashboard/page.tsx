import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { logout } from "@/lib/auth/actions";
import { listMyClients } from "@/lib/data/trainer";
import { attentionLevel } from "@/lib/data/progress";

const GOAL_LABEL: Record<string, string> = {
  fat_loss: "Fat Loss",
  muscle_gain: "Muscle Gain",
  maintenance: "Maintenance",
  general_fitness: "General Fitness",
};

const DOT_CLASS: Record<string, string> = {
  green: "bg-green-500",
  yellow: "bg-amber-400",
  red: "bg-red-500",
};

export default async function TrainerDashboardPage() {
  const profile = await requireRole("trainer");
  const clients = await listMyClients(profile.id);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">My Clients</h1>
          <p className="text-sm text-neutral-500">{clients.length} active clients</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/trainer/sessions" className="text-sm text-neutral-700 underline">Sessions</Link>
          <form action={logout}>
            <button className="text-sm text-neutral-500 underline">Sign out</button>
          </form>
        </div>
      </div>

      <div className="space-y-2">
        {clients.length === 0 && (
          <div className="rounded-lg border border-neutral-200 p-6 text-center text-sm text-neutral-400">
            No clients assigned yet.
          </div>
        )}
        {clients.map((c) => (
          <Link
            key={c.id}
            href={`/trainer/clients/${c.id}`}
            className="flex items-center justify-between rounded-lg border border-neutral-200 p-4 hover:bg-neutral-50"
          >
            <div className="flex items-center gap-3">
              <span className={`h-2.5 w-2.5 rounded-full ${DOT_CLASS[attentionLevel(c.lastCheckin)]}`} />
              <div>
                <p className="font-medium text-neutral-900">{c.fullName}</p>
                <p className="text-sm text-neutral-500">
                  {c.latestWeightKg ? `${c.latestWeightKg} kg` : "No weigh-in"} ·{" "}
                  {c.goal ? GOAL_LABEL[c.goal] : "No goal set"}
                </p>
              </div>
            </div>
            <p className="text-xs text-neutral-400">
              {c.lastCheckin ? `Last check-in: ${new Date(c.lastCheckin).toLocaleDateString()}` : "No check-ins"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
