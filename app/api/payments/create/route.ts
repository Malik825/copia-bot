import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { planName, billingCycle, amount } = await request.json();

    if (!planName || !billingCycle || !amount) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const nowpaymentsApiKey = process.env.NOWPAYMENTS_API_KEY;
    if (!nowpaymentsApiKey || nowpaymentsApiKey.includes("your_nowpayments_api_key_here")) {
      return NextResponse.json(
        { success: false, error: "NOWPayments API key not configured" },
        { status: 500 }
      );
    }

    // 1. Save the pending invoice to Supabase first to get an ID
    const { data: invoice, error: dbError } = await supabase
      .from("invoices")
      .insert({
        user_id: user.id,
        plan_name: planName,
        billing_cycle: billingCycle,
        amount: amount,
        status: "pending",
      })
      .select()
      .single();

    if (dbError || !invoice) {
      console.error("Supabase Database Error:", dbError);
      return NextResponse.json({ success: false, error: "Failed to create local invoice" }, { status: 500 });
    }

    // 2. Create a NOWPayments Invoice
    // In production, replace `yourdomain.com` with your actual domain
    const payload = {
      price_amount: amount,
      price_currency: "usd",
      order_id: invoice.id,
      order_description: `TruFunder ${planName} Plan (${billingCycle})`,
      ipn_callback_url: "https://yourdomain.com/api/payments/webhook", 
      success_url: "https://yourdomain.com/admin",
      cancel_url: "https://yourdomain.com/pricing"
    };

    const nowResponse = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": nowpaymentsApiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!nowResponse.ok) {
      const err = await nowResponse.text();
      console.error("NOWPayments Error:", err);
      // Clean up the pending invoice if API fails
      await supabase.from("invoices").delete().eq("id", invoice.id);
      return NextResponse.json({ success: false, error: "Failed to create crypto invoice with provider" }, { status: 500 });
    }

    const nowData = await nowResponse.json();

    // 3. Update the Supabase invoice with the provider's ID and URL
    await supabase
      .from("invoices")
      .update({
        provider_id: nowData.id,
        checkout_url: nowData.invoice_url
      })
      .eq("id", invoice.id);

    // 4. Return the hosted URL to the frontend
    return NextResponse.json({
      success: true,
      data: {
        checkoutUrl: nowData.invoice_url,
      },
    });

  } catch (error) {
    console.error("Payment Creation Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
