import { requireRole } from "@/lib/auth/require-role";
import { getActiveTrainerOptions } from "@/lib/data/admin";
import { NewClientForm } from "./form";

export default async function NewClientPage() {
  await requireRole("admin");
  const trainers = await getActiveTrainerOptions();

  return (
    <div className="mx-auto max-w-lg px-6 py-8">
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">New Client</h1>
      <NewClientForm trainers={trainers} />
    </div>
  );
}
