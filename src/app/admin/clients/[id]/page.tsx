import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { getClientDetail, getActiveTrainerOptions } from "@/lib/data/admin";
import { setClientActive } from "@/lib/actions/admin";
import { ReassignForm } from "./reassign-form";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("admin");
  const { id } = await params;

  const [client, trainers] = await Promise.all([
    getClientDetail(id).catch(() => null),
    getActiveTrainerOptions(),
  ]);

  if (!client) notFound();

  const profile = (client as any).profile;
  const activeAssignment = ((client as any).assignments ?? []).find((a: any) => a.ended_at === null);
  const setActive = setClientActive.bind(null, id, !profile.is_active);

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <nav className="mb-1 text-xs text-neutral-400">
        <Link href="/admin/clients" className="hover:underline">Clients</Link> / {profile.full_name}
      </nav>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">{profile.full_name}</h1>
        <form action={setActive}>
          <button
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              profile.is_active ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
            }`}
          >
            {profile.is_active ? "Deactivate" : "Activate"}
          </button>
        </form>
      </div>

      <dl className="mb-8 grid grid-cols-2 gap-4 rounded-lg border border-neutral-200 p-4 text-sm">
        <div>
          <dt className="text-neutral-400">Email</dt>
          <dd className="text-neutral-900">{profile.email}</dd>
        </div>
        <div>
          <dt className="text-neutral-400">Goal</dt>
          <dd className="text-neutral-900">{client.goal ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-neutral-400">Starting weight</dt>
          <dd className="text-neutral-900">{client.starting_weight_kg ? `${client.starting_weight_kg} kg` : "—"}</dd>
        </div>
        <div>
          <dt className="text-neutral-400">Height</dt>
          <dd className="text-neutral-900">{client.height_cm ? `${client.height_cm} cm` : "—"}</dd>
        </div>
      </dl>

      <div className="rounded-lg border border-neutral-200 p-4">
        <h2 className="mb-3 text-sm font-medium text-neutral-900">Trainer assignment</h2>
        <p className="mb-4 text-sm text-neutral-500">
          Currently assigned to:{" "}
          <span className="font-medium text-neutral-900">
            {activeAssignment?.trainer?.full_name ?? "Nobody"}
          </span>
        </p>
        <ReassignForm clientId={id} trainers={trainers} />
      </div>
    </div>
  );
}
