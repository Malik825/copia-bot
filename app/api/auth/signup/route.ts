import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const { email, password, telegramUsername } = await request.json();

    if (!email || !password) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          telegram_username: telegramUsername || undefined,
        },
      },
    });

    if (error) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    // If email confirmation is enabled in Supabase, data.session will be null
    // until the user confirms. We return the user either way.
    return NextResponse.json<ApiResponse<{ user: typeof data.user; needsConfirmation: boolean }>>({
      success: true,
      data: {
        user: data.user,
        needsConfirmation: !data.session,
      },
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
