import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { logout } from "@/lib/auth/actions";
import { listClients, listTrainers } from "@/lib/data/admin";

export default async function AdminDashboardPage() {
  const profile = await requireRole("admin");
  const [clients, trainers] = await Promise.all([listClients(), listTrainers()]);

  const activeClients = clients.filter((c) => c.isActive).length;
  const activeTrainers = trainers.filter((t) => t.isActive).length;
  const unassigned = clients.filter((c) => !c.trainerName).length;

  const stats: [string, number][] = [
    ["Active Clients", activeClients],
    ["Active Trainers", activeTrainers],
    ["Total Clients", clients.length],
    ["Total Trainers", trainers.length],
    ["Unassigned Clients", unassigned],
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Admin Dashboard</h1>
          <p className="text-sm text-neutral-500">Signed in as {profile.full_name}</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/clients" className="text-sm text-neutral-700 underline">Clients</Link>
          <Link href="/admin/trainers" className="text-sm text-neutral-700 underline">Trainers</Link>
          <form action={logout}>
            <button className="text-sm text-neutral-500 underline">Sign out</button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-neutral-200 p-4">
            <p className="text-2xl font-semibold text-neutral-900">{value}</p>
            <p className="text-xs text-neutral-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-neutral-200 p-4">
        <h2 className="mb-3 text-sm font-medium text-neutral-900">Recently added clients</h2>
        <ul className="divide-y divide-neutral-100 text-sm">
          {clients.slice(0, 5).map((c) => (
            <li key={c.id} className="flex items-center justify-between py-2">
              <Link href={`/admin/clients/${c.id}`} className="text-neutral-900 hover:underline">
                {c.fullName}
              </Link>
              <span className="text-neutral-400">{c.trainerName ?? "Unassigned"}</span>
            </li>
          ))}
          {clients.length === 0 && <li className="py-2 text-neutral-400">No clients yet.</li>}
        </ul>
      </div>
    </div>
  );
}
