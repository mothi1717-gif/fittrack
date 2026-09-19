import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { listClients } from "@/lib/data/admin";
import { logout } from "@/lib/auth/actions";

export default async function AdminClientsPage() {
  await requireRole("admin");
  const clients = await listClients();

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <nav className="mb-1 text-xs text-neutral-400">
            <Link href="/admin/dashboard" className="hover:underline">
              Dashboard
            </Link>{" "}
            / Clients
          </nav>
          <h1 className="text-xl font-semibold text-neutral-900">Clients</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/clients/new"
            className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white"
          >
            + New Client
          </Link>
          <form action={logout}>
            <button className="text-sm text-neutral-500 underline">Sign out</button>
          </form>
        </div>
      </header>

      <div className="overflow-hidden rounded-lg border border-neutral-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Goal</th>
              <th className="px-4 py-2 font-medium">Trainer</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {clients.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-neutral-400">
                  No clients yet.
                </td>
              </tr>
            )}
            {clients.map((c) => (
              <tr key={c.id} className="hover:bg-neutral-50">
                <td className="px-4 py-2">
                  <Link href={`/admin/clients/${c.id}`} className="font-medium text-neutral-900 hover:underline">
                    {c.fullName}
                  </Link>
                </td>
                <td className="px-4 py-2 text-neutral-500">{c.email}</td>
                <td className="px-4 py-2 text-neutral-500">{c.goal ?? "—"}</td>
                <td className="px-4 py-2 text-neutral-500">{c.trainerName ?? "Unassigned"}</td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      c.isActive ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {c.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
