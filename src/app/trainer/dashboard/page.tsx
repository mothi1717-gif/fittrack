import { requireRole } from "@/lib/auth/require-role";
import { logout } from "@/lib/auth/actions";

export default async function TrainerDashboardPage() {
  const profile = await requireRole("trainer");

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">My Clients</h1>
          <p className="text-sm text-neutral-500">Signed in as {profile.full_name}</p>
        </div>
        <form action={logout}>
          <button className="text-sm text-neutral-500 underline">Sign out</button>
        </form>
      </div>

      <div className="rounded-lg border border-neutral-200 p-6 text-sm text-neutral-500">
        No clients assigned yet. Client list, check-ins, and workout/diet
        builders land in Phase 3–5.
      </div>
    </div>
  );
}
