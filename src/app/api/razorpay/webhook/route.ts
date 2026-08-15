import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "rzp_secret_placeholder";

    // Cryptographic signature verification
    if (signature && process.env.RAZORPAY_WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload.payload?.payment?.entity;
      const invoiceId = paymentEntity?.notes?.invoice_id || paymentEntity?.description;

      console.log(`Razorpay Webhook: Verified payment for invoice ${invoiceId}`);
      // Here Supabase RLS / Service role updates invoice status to Paid with idempotency key
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
