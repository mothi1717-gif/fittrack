import { requireRole } from "@/lib/auth/require-role";
import { getMyClientRecord } from "@/lib/data/client";
import { logout } from "@/lib/auth/actions";
import { ProfileForm } from "./form";

export default async function ClientProfilePage() {
  const profile = await requireRole("client");
  const clientRecord = await getMyClientRecord(profile.id);

  return (
    <div className="px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-neutral-900">Profile</h1>
        <form action={logout}>
          <button className="text-sm text-neutral-500 underline">Sign out</button>
        </form>
      </div>

      <p className="mb-4 text-sm text-neutral-500">
        {profile.full_name} · {profile.email}
      </p>

      <ProfileForm clientRecord={clientRecord} />
    </div>
  );
}
