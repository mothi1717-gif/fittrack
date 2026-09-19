import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getActiveDietPlan(clientId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("diet_plans")
    .select(
      `id, title, pdf_storage_path,
       meals:diet_meals (
         id, name, time_of_day,
         items:diet_items ( id, food, quantity, calories, protein_g, carbs_g, fat_g )
       )`
    )
    .eq("client_id", clientId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  return data as any;
}

export async function getSignedDietPdfUrl(storagePath: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("diet-pdfs")
    .createSignedUrl(storagePath, 60 * 10); // 10 minutes

  if (error) throw error;
  return data.signedUrl;
}
