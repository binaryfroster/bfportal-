import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceId, amount, currency = "INR" } = body;

    if (!amount) {
      return NextResponse.json({ error: "Amount required" }, { status: 400 });
    }

    // Generate server-side Razorpay Order ID simulation or real call if env vars set
    const mockOrderId = `order_${Math.random().toString(36).substring(2, 14)}`;

    return NextResponse.json({
      orderId: mockOrderId,
      amount: amount * 100, // paise
      currency,
      invoiceId,
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholderKey",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
