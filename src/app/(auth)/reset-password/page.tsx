"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/reset-password/confirm`,
    });
    setStatus(error ? "error" : "sent");
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-xl font-semibold text-neutral-900">Reset password</h1>
        <p className="mb-6 text-sm text-neutral-500">
          We&apos;ll email you a link to set a new password.
        </p>

        {status === "sent" ? (
          <p className="text-sm text-neutral-700">
            Check your email for a reset link.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
            />
            {status === "error" && (
              <p className="text-sm text-red-600">Something went wrong. Try again.</p>
            )}
            <button
              type="submit"
              className="w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white"
            >
              Send reset link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
