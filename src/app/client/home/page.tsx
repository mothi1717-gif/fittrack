import { requireRole } from "@/lib/auth/require-role";
import { logout } from "@/lib/auth/actions";

export default async function ClientHomePage() {
  const profile = await requireRole("client");

  return (
    <div className="mx-auto max-w-md px-4 py-6 pb-24">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-neutral-900">
          Good day, {profile.full_name.split(" ")[0]}
        </h1>
        <form action={logout}>
          <button className="text-sm text-neutral-500 underline">Sign out</button>
        </form>
      </div>

      <div className="rounded-lg border border-neutral-200 p-4 text-sm text-neutral-500">
        Complete your profile to see your calorie target, today&apos;s workout,
        and diet. This lands in Phase 3.
      </div>

      <nav className="fixed inset-x-0 bottom-0 flex justify-around border-t border-neutral-200 bg-white py-2">
        {["Home", "Workout", "Diet", "Progress", "Profile"].map((label) => (
          <span key={label} className="px-2 text-xs text-neutral-500">
            {label}
          </span>
        ))}
      </nav>
    </div>
  );
}
