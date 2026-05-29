import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-nowpayments-sig");
    const webhookSecret = process.env.NOWPAYMENTS_IPN_SECRET;

    if (!webhookSecret) {
      console.error("NOWPayments Webhook Secret is not configured.");
      return NextResponse.json({ error: "Configuration Error" }, { status: 500 });
    }

    if (!signature) {
      return NextResponse.json({ error: "No signature provided" }, { status: 400 });
    }

    // Verify NOWPayments Webhook Signature
    // NOWPayments requires stringifying the payload with keys sorted, but using the exact raw body string usually works for IPNs too.
    const hmac = crypto.createHmac("hmac-sha512", webhookSecret);
    hmac.update(rawBody);
    const expectedSignature = hmac.digest("hex");

    if (signature !== expectedSignature) {
      console.error("Webhook signature mismatch.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    // We only care about finished payments
    if (event.payment_status === "finished") {
      const invoiceId = event.order_id; // This matches our Supabase invoice.id

      // Initialize Supabase Admin Client
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // 1. Update the invoice status to completed
      const { error: updateError } = await supabaseAdmin
        .from("invoices")
        .update({ status: "completed" })
        .eq("id", invoiceId);

      if (updateError) {
        console.error("Failed to update invoice status:", updateError);
        return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
      }

      console.log(`Payment confirmed for invoice ${invoiceId}`);
      
      // TODO: Update the user's plan tier on their `public.profiles` or user_metadata here.
    } else if (event.payment_status === "failed" || event.payment_status === "expired") {
      const invoiceId = event.order_id;
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      await supabaseAdmin
        .from("invoices")
        .update({ status: "failed" })
        .eq("id", invoiceId);
        
      console.log(`Payment failed for invoice: ${invoiceId}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Webhook Error" }, { status: 500 });
  }
}
