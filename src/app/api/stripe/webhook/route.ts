import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const payload = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing stripe signature" }, { status: 400 });
    }

    // In a real environment, verify Stripe signatures:
    // const event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    // if (event.type === 'checkout.session.completed') { ... }

    // Log for audit purposes
    console.log("Stripe Webhook received payload length:", payload.length);

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Stripe Webhook error:", error);
    return NextResponse.json({ error: error.message || "Webhook processing error" }, { status: 500 });
  }
}
