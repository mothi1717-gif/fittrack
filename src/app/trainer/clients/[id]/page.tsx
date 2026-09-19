import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { getClientForTrainer } from "@/lib/data/trainer";
import { getActiveWorkoutPlan } from "@/lib/data/workouts";
import { getActiveDietPlan } from "@/lib/data/diet";
import { getCheckinHistory } from "@/lib/data/progress";
import { WorkoutBuilder } from "./workout-builder";
import { DietUploadForm } from "./diet-upload-form";

export default async function TrainerClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("trainer");
  const { id } = await params;

  const client = await getClientForTrainer(id).catch(() => null);
  if (!client) notFound();

  const [plan, diet, checkins] = await Promise.all([
    getActiveWorkoutPlan(id),
    getActiveDietPlan(id),
    getCheckinHistory(id, 7),
  ]);

  const profile = client.profile;

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <nav className="mb-1 text-xs text-neutral-400">
        <Link href="/trainer/dashboard" className="hover:underline">My Clients</Link> / {profile.full_name}
      </nav>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">{profile.full_name}</h1>
        <Link href={`/trainer/clients/${id}/messages`} className="text-sm text-neutral-700 underline">
          Message
        </Link>
      </div>

      <dl className="mb-6 grid grid-cols-2 gap-4 rounded-lg border border-neutral-200 p-4 text-sm">
        <div>
          <dt className="text-neutral-400">Goal</dt>
          <dd className="text-neutral-900">{client.goal ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-neutral-400">Starting weight</dt>
          <dd className="text-neutral-900">
            {client.starting_weight_kg ? `${client.starting_weight_kg} kg` : "—"}
          </dd>
        </div>
      </dl>

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold text-neutral-900">Workout plan</h2>
        <WorkoutBuilder clientId={id} plan={plan} />
      </section>

      <section className="mb-6 rounded-lg border border-neutral-200 p-4">
        <h2 className="mb-2 text-sm font-semibold text-neutral-900">Diet plan</h2>
        {diet ? (
          <p className="mb-3 text-sm text-neutral-600">Current: {diet.title}</p>
        ) : (
          <p className="mb-3 text-sm text-neutral-400">No diet plan uploaded yet.</p>
        )}
        <DietUploadForm clientId={id} />
      </section>

      <section className="rounded-lg border border-neutral-200 p-4">
        <h2 className="mb-2 text-sm font-semibold text-neutral-900">Recent check-ins</h2>
        <ul className="space-y-1 text-sm text-neutral-600">
          {checkins.map((c) => (
            <li key={c.id} className="flex justify-between">
              <span>{new Date(c.checkin_date).toLocaleDateString()}</span>
              <span>
                {c.workout_status ?? "—"} · {c.diet_status ?? "—"} · {c.energy ?? "—"}
              </span>
            </li>
          ))}
          {checkins.length === 0 && <li className="text-neutral-400">No check-ins yet.</li>}
        </ul>
      </section>
    </div>
  );
}
