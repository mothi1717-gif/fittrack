import { requireRole } from "@/lib/auth/require-role";
import { logout } from "@/lib/auth/actions";

export default async function AdminDashboardPage() {
  const profile = await requireRole("admin");

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Admin Dashboard</h1>
          <p className="text-sm text-neutral-500">Signed in as {profile.full_name}</p>
        </div>
        <form action={logout}>
          <button className="text-sm text-neutral-500 underline">Sign out</button>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {[
          ["Active Clients", "—"],
          ["Active Trainers", "—"],
          ["Today's Sessions", "—"],
          ["Completed", "—"],
          ["Need Attention", "—"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-neutral-200 p-4">
            <p className="text-2xl font-semibold text-neutral-900">{value}</p>
            <p className="text-xs text-neutral-500">{label}</p>
          </div>
        ))}
      </div>

      <p className="mt-8 text-sm text-neutral-400">
        Phase 1 scaffold: auth, roles, and RLS are wired up. Client/trainer management
        UI lands in Phase 2.
      </p>
    </div>
  );
}
