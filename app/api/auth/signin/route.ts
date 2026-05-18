import { NextResponse } from "next/server";
import { ApiResponse, AuthSession } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    // Mock validation
    if (password.length < 6) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Invalid credentials. Password must be at least 6 characters." },
        { status: 401 }
      );
    }

    const session: AuthSession = {
      token: "mock-jwt-token-" + Math.random().toString(36).substring(2),
      user: {
        id: "usr-" + Math.random().toString(36).substring(2, 9),
        email: email,
        telegramUsername: "trader_pro",
        createdAt: new Date().toISOString(),
      },
    };

    return NextResponse.json<ApiResponse<AuthSession>>({
      success: true,
      data: session,
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
