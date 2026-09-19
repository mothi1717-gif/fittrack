import { requireRole } from "@/lib/auth/require-role";
import { getMeasurementHistory, getActivityHistory, getCheckinHistory } from "@/lib/data/progress";
import { WeightChart } from "@/components/client/weight-chart";
import { LogMeasurementForm } from "./log-measurement-form";
import { LogActivityForm } from "./log-activity-form";

export default async function ClientProgressPage() {
  const profile = await requireRole("client");

  const [measurements, activity, checkins] = await Promise.all([
    getMeasurementHistory(profile.id),
    getActivityHistory(profile.id),
    getCheckinHistory(profile.id, 7),
  ]);

  const weightPoints = [...measurements]
    .filter((m) => m.weight_kg !== null)
    .reverse()
    .map((m) => ({ date: m.recorded_at, weight: m.weight_kg as number }));

  const workoutsCompleted = checkins.filter((c) => c.workout_status === "completed").length;

  return (
    <div className="px-4 py-6">
      <h1 className="mb-4 text-lg font-semibold text-neutral-900">Progress</h1>

      <div className="mb-4 rounded-lg border border-neutral-200 p-4">
        <p className="mb-2 text-xs text-neutral-400">Weight trend</p>
        <WeightChart points={weightPoints} />
      </div>

      <div className="mb-4 rounded-lg border border-neutral-200 p-4">
        <p className="text-xs text-neutral-400">Workout consistency (last 7 days)</p>
        <p className="text-xl font-semibold text-neutral-900">{workoutsCompleted} / 7 days</p>
      </div>

      <div className="mb-4 rounded-lg border border-neutral-200 p-4">
        <p className="mb-2 text-sm font-medium text-neutral-900">Log a measurement</p>
        <LogMeasurementForm />
      </div>

      <div className="mb-4 rounded-lg border border-neutral-200 p-4">
        <p className="mb-2 text-sm font-medium text-neutral-900">Log activity</p>
        <LogActivityForm />
      </div>

      <div className="rounded-lg border border-neutral-200 p-4">
        <p className="mb-2 text-sm font-medium text-neutral-900">Recent activity</p>
        <ul className="space-y-1 text-sm text-neutral-600">
          {activity.slice(0, 5).map((a) => (
            <li key={a.id} className="flex justify-between">
              <span>{new Date(a.recorded_at).toLocaleDateString()}</span>
              <span>
                {a.walking_km ? `${a.walking_km}km walk` : ""} {a.running_km ? `${a.running_km}km run` : ""}{" "}
                {a.steps ? `${a.steps} steps` : ""}
              </span>
            </li>
          ))}
          {activity.length === 0 && <li className="text-neutral-400">No activity logged yet.</li>}
        </ul>
      </div>
    </div>
  );
}
