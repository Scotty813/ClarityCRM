"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function InviteCallbackClientPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) {
      return;
    }

    hasRun.current = true;

    let cancelled = false;
    const supabase = createClient();

    function hasInviteMetadata(user: { user_metadata?: Record<string, unknown> } | null) {
      const invitedOrg = user?.user_metadata?.invited_to_org;
      return typeof invitedOrg === "string" && invitedOrg.length > 0;
    }

    function safelySetError(message: string) {
      if (!cancelled) {
        setError(message);
      }
    }

    function redirectToSetPassword() {
      window.history.replaceState(null, "", "/auth/invite-callback/client");
      router.replace("/auth/set-password");
    }

    async function completeInviteSignIn() {
      const hash = window.location.hash.startsWith("#")
        ? window.location.hash.substring(1)
        : window.location.hash;
      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (!accessToken || !refreshToken) {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          safelySetError(userError.message);
          return;
        }

        if (hasInviteMetadata(user)) {
          redirectToSetPassword();
          return;
        }

        safelySetError("Invite link is missing session tokens.");
        return;
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        safelySetError(sessionError.message);
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        safelySetError(userError.message);
        return;
      }

      if (!user) {
        safelySetError("Failed to establish session from invite link.");
        return;
      }

      redirectToSetPassword();
    }

    void completeInviteSignIn();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {!error ? (
          <>
            <h1 className="text-2xl font-bold">Completing invite sign in</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Please wait while we secure your session.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">Authentication Error</h1>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <Button asChild className="mt-6">
              <Link href="/">Back to Home</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
