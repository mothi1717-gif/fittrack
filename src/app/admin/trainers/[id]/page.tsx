import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { getTrainerDetail, getActiveTrainerOptions } from "@/lib/data/admin";
import { setTrainerActive } from "@/lib/actions/admin";
import { BulkReassignForm } from "./bulk-reassign-form";

export default async function TrainerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("admin");
  const { id } = await params;

  const [trainer, otherTrainers] = await Promise.all([
    getTrainerDetail(id).catch(() => null),
    getActiveTrainerOptions(),
  ]);

  if (!trainer) notFound();

  const profile = (trainer as any).profile;
  const activeClients = ((trainer as any).assignments ?? []).filter((a: any) => a.ended_at === null);
  const candidates = otherTrainers.filter((t) => t.id !== id);
  const deactivate = setTrainerActive.bind(null, id, !profile.is_active);

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <nav className="mb-1 text-xs text-neutral-400">
        <Link href="/admin/trainers" className="hover:underline">Trainers</Link> / {profile.full_name}
      </nav>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">{profile.full_name}</h1>
        {profile.is_active && activeClients.length === 0 && (
          <form action={deactivate}>
            <button className="rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700">
              Deactivate
            </button>
          </form>
        )}
        {!profile.is_active && (
          <form action={deactivate}>
            <button className="rounded-md bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">
              Activate
            </button>
          </form>
        )}
      </div>

      <p className="mb-6 text-sm text-neutral-500">{profile.email}</p>

      {profile.is_active && activeClients.length > 0 && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="mb-3 text-sm text-amber-800">
            This trainer currently has <strong>{activeClients.length}</strong> assigned client
            {activeClients.length === 1 ? "" : "s"}. Reassign them before deactivating — client
            history is preserved either way.
          </p>
          <BulkReassignForm fromTrainerId={id} trainers={candidates} />
        </div>
      )}

      <div className="rounded-lg border border-neutral-200">
        <h2 className="border-b border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-900">
          Assigned clients ({activeClients.length})
        </h2>
        <ul className="divide-y divide-neutral-100">
          {activeClients.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-neutral-400">No clients assigned.</li>
          )}
          {activeClients.map((a: any) => (
            <li key={a.client_id} className="px-4 py-2 text-sm text-neutral-900">
              {a.client?.full_name ?? "—"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
