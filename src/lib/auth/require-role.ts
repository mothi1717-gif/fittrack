import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types/database";

// Defense in depth: middleware already redirects wrong roles away from
// /admin, /trainer, /client, but every server component that renders
// role-specific data should also assert its own role requirement.
export async function requireRole(role: UserRole) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name, email, is_active")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.is_active || profile.role !== role) {
    redirect("/login");
  }

  return profile;
}
