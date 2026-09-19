import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { logout } from "@/lib/auth/actions";
import { getMyClientRecord, getMyActiveTrainer, getLatestWeight } from "@/lib/data/client";
import { getActiveWorkoutPlan } from "@/lib/data/workouts";
import { getActiveDietPlan } from "@/lib/data/diet";
import { getTodayCheckin } from "@/lib/data/progress";
import { getUpcomingSessionsForClient } from "@/lib/data/sessions";
import { calculateCalories } from "@/lib/calorie/calculate";
import { CheckinForm } from "./checkin-form";

const GOAL_LABEL: Record<string, string> = {
  fat_loss: "Fat Loss",
  muscle_gain: "Muscle Gain",
  maintenance: "Maintenance",
  general_fitness: "General Fitness",
};

function age(dob: string | null) {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export default async function ClientHomePage() {
  const profile = await requireRole("client");

  const [clientRecord, trainer, weightKg, workoutPlan, dietPlan, checkin, sessions] = await Promise.all([
    getMyClientRecord(profile.id),
    getMyActiveTrainer(profile.id),
    getLatestWeight(profile.id),
    getActiveWorkoutPlan(profile.id),
    getActiveDietPlan(profile.id),
    getTodayCheckin(profile.id),
    getUpcomingSessionsForClient(profile.id),
  ]);

  const profileComplete =
    clientRecord?.date_of_birth && clientRecord.sex && clientRecord.height_cm && clientRecord.goal && clientRecord.activity_level;

  const calories =
    profileComplete && weightKg
      ? calculateCalories({
          age: age(clientRecord!.date_of_birth)!,
          sex: clientRecord!.sex as "male" | "female",
          heightCm: clientRecord!.height_cm!,
          weightKg,
          activityLevel: clientRecord!.activity_level as any,
          goal: clientRecord!.goal as any,
        })
      : null;

  const firstName = profile.full_name.split(" ")[0];

  return (
    <div className="px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-neutral-900">Good day, {firstName}</h1>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/client/messages" className="text-neutral-600 underline">Messages</Link>
          <form action={logout}>
            <button className="text-neutral-500 underline">Sign out</button>
          </form>
        </div>
      </div>

      {!profileComplete && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Complete your profile to see your personalized calorie target.{" "}
          <Link href="/client/profile" className="underline">Complete now</Link>
        </div>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-neutral-200 p-4">
          <p className="text-xs text-neutral-400">Current Weight</p>
          <p className="text-xl font-semibold text-neutral-900">{weightKg ? `${weightKg} kg` : "—"}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-4">
          <p className="text-xs text-neutral-400">Goal</p>
          <p className="text-xl font-semibold text-neutral-900">
            {clientRecord?.goal ? GOAL_LABEL[clientRecord.goal] : "—"}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-4">
          <p className="text-xs text-neutral-400">Maintenance (est.)</p>
          <p className="text-xl font-semibold text-neutral-900">
            {calories ? `${calories.maintenanceCalories} kcal` : "—"}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-4">
          <p className="text-xs text-neutral-400">Daily Target</p>
          <p className="text-xl font-semibold text-neutral-900">
            {calories ? `${calories.targetCalories} kcal` : "—"}
          </p>
        </div>
      </div>
      {calories && (
        <p className="mb-4 text-xs text-neutral-400">
          Estimate only, not medical advice. Based on the standard Mifflin-St Jeor formula.
        </p>
      )}

      <Link href="/client/workout" className="mb-3 block rounded-lg border border-neutral-200 p-4">
        <p className="text-xs text-neutral-400">Today&apos;s Workout</p>
        <p className="text-base font-medium text-neutral-900">
          {workoutPlan?.title ?? "No workout assigned yet"}
        </p>
        {workoutPlan && (
          <p className="text-sm text-neutral-500">
            {workoutPlan.days?.length ?? 0} day{(workoutPlan.days?.length ?? 0) === 1 ? "" : "s"}
          </p>
        )}
      </Link>

      <Link href="/client/diet" className="mb-3 block rounded-lg border border-neutral-200 p-4">
        <p className="text-xs text-neutral-400">Today&apos;s Diet</p>
        <p className="text-base font-medium text-neutral-900">{dietPlan?.title ?? "No diet plan yet"}</p>
      </Link>

      <div className="mb-3 rounded-lg border border-neutral-200 p-4">
        <p className="mb-2 text-xs text-neutral-400">Daily Check-in</p>
        {checkin ? (
          <p className="text-sm text-neutral-700">Submitted for today. Thanks!</p>
        ) : (
          <CheckinForm />
        )}
      </div>

      <div className="mb-3 rounded-lg border border-neutral-200 p-4">
        <p className="mb-1 text-xs text-neutral-400">Upcoming Session</p>
        {sessions.length > 0 ? (
          <div>
            <p className="text-sm font-medium text-neutral-900">{sessions[0].title}</p>
            <p className="text-sm text-neutral-500">
              {new Date(sessions[0].scheduled_at).toLocaleString(undefined, {
                weekday: "short",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
            {sessions[0].meet_link && (
              <a href={sessions[0].meet_link} className="text-sm text-neutral-700 underline">
                Join link
              </a>
            )}
          </div>
        ) : (
          <p className="text-sm text-neutral-500">No upcoming sessions.</p>
        )}
      </div>

      <p className="text-xs text-neutral-400">
        Trainer: {trainer?.fullName ?? "Not yet assigned — check with your business owner."}
      </p>
    </div>
  );
}
