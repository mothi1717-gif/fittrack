import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { listTrainers } from "@/lib/data/admin";

export default async function AdminTrainersPage() {
  await requireRole("admin");
  const trainers = await listTrainers();

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <nav className="mb-1 text-xs text-neutral-400">
            <Link href="/admin/dashboard" className="hover:underline">Dashboard</Link> / Trainers
          </nav>
          <h1 className="text-xl font-semibold text-neutral-900">Trainers</h1>
        </div>
        <Link
          href="/admin/trainers/new"
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white"
        >
          + New Trainer
        </Link>
      </header>

      <div className="overflow-hidden rounded-lg border border-neutral-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Active clients</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {trainers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-neutral-400">No trainers yet.</td>
              </tr>
            )}
            {trainers.map((t) => (
              <tr key={t.id} className="hover:bg-neutral-50">
                <td className="px-4 py-2">
                  <Link href={`/admin/trainers/${t.id}`} className="font-medium text-neutral-900 hover:underline">
                    {t.fullName}
                  </Link>
                </td>
                <td className="px-4 py-2 text-neutral-500">{t.email}</td>
                <td className="px-4 py-2 text-neutral-500">{t.activeClientCount}</td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      t.isActive ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {t.isActive ? "Active" : "Inactive"}
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
