import { requireRole } from "@/lib/auth/require-role";
import { getActiveDietPlan, getSignedDietPdfUrl } from "@/lib/data/diet";

export default async function ClientDietPage() {
  const profile = await requireRole("client");
  const plan = await getActiveDietPlan(profile.id);

  if (!plan) {
    return (
      <div className="px-4 py-6">
        <h1 className="mb-4 text-lg font-semibold text-neutral-900">Diet</h1>
        <p className="text-sm text-neutral-500">No diet plan assigned yet.</p>
      </div>
    );
  }

  const pdfUrl = plan.pdf_storage_path ? await getSignedDietPdfUrl(plan.pdf_storage_path) : null;
  const meals = [...(plan.meals ?? [])].sort((a: any, b: any) =>
    (a.time_of_day ?? "").localeCompare(b.time_of_day ?? "")
  );

  return (
    <div className="px-4 py-6">
      <h1 className="mb-1 text-lg font-semibold text-neutral-900">{plan.title}</h1>

      {pdfUrl && (
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-4 block rounded-lg border border-neutral-200 p-3 text-sm text-neutral-700 underline"
        >
          View diet PDF
        </a>
      )}

      {meals.length > 0 && (
        <div className="space-y-3">
          {meals.map((meal: any) => (
            <div key={meal.id} className="rounded-lg border border-neutral-200 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-medium text-neutral-900">{meal.name}</p>
                {meal.time_of_day && <p className="text-xs text-neutral-400">{meal.time_of_day}</p>}
              </div>
              <ul className="space-y-1 text-sm text-neutral-600">
                {(meal.items ?? []).map((item: any) => (
                  <li key={item.id} className="flex justify-between">
                    <span>
                      {item.food} ({item.quantity})
                    </span>
                    <span className="text-neutral-400">
                      {item.calories ? `${item.calories} kcal` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
