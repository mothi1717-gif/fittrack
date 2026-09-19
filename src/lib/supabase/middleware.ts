import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/types/database";

const ROLE_HOME: Record<string, string> = {
  admin: "/admin/dashboard",
  trainer: "/trainer/dashboard",
  client: "/client/home",
};

const PUBLIC_PATHS = ["/login", "/reset-password"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some((p) => path.startsWith(p));

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .single();

    if (!profile || !profile.is_active) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "account_inactive");
      return NextResponse.redirect(url);
    }

    const home = ROLE_HOME[profile.role];

    // Logged in but sitting on /login or / -> send to their dashboard.
    if (isPublic || path === "/") {
      const url = request.nextUrl.clone();
      url.pathname = home;
      return NextResponse.redirect(url);
    }

    // Prevent a client from typing /admin/... etc. into the URL bar.
    // (Backend RLS also enforces this — this is just a UX-level guard.)
    const inWrongArea =
      (path.startsWith("/admin") && profile.role !== "admin") ||
      (path.startsWith("/trainer") && profile.role !== "trainer") ||
      (path.startsWith("/client") && profile.role !== "client");

    if (inWrongArea) {
      const url = request.nextUrl.clone();
      url.pathname = home;
      return NextResponse.redirect(url);
    }
  }

  return response;
}
