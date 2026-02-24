import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { resolveOrigin } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = resolveOrigin(request.headers) ?? new URL(request.url).origin;
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (!token_hash || type !== "invite") {
    // Some invite flows return tokens in the URL hash fragment. Since hash
    // values are not sent to the server, hand off to a client page that can
    // complete session setup from window.location.hash.
    return NextResponse.redirect(`${origin}/auth/invite-callback/client`);
  }

  // Pre-create the success redirect so we can set cookies directly on it.
  const response = NextResponse.redirect(`${origin}/auth/set-password`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Clear any existing browser session before attaching the invited user.
  const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
  if (signOutError) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const { error: verifyError } = await supabase.auth.verifyOtp({ token_hash, type: "invite" });

  if (!verifyError) {
    return response; // Carries all Set-Cookie headers from signOut + verifyOtp.
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
