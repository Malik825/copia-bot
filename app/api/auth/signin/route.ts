import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json<ApiResponse<{ user: typeof data.user }>>({
      success: true,
      data: { user: data.user },
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
