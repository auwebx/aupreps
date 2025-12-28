// app/api/paystack/initialize/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { amount } = await request.json();

    if (!amount || amount < 200000) {
      // 5000 Naira in kobo
      return NextResponse.json(
        { error: "Invalid amount. Minimum is ₦2,000" },
        { status: 400 }
      );
    }

    // Get user email from token or session
    const cookieStore = await cookies();
    const token =
      cookieStore.get("token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    let userEmail = "user@example.com"; // Default fallback

    if (token) {
      try {
        // Decode JWT to get user email
        const payload = JSON.parse(atob(token.split(".")[1]));
        userEmail = payload.email || payload.username;
      } catch (e) {
        console.error("Failed to decode token:", e);
      }
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      return NextResponse.json(
        { error: "Payment service not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          email: userEmail,
          callback_url: `${
            process.env.NEXT_PUBLIC_BASE_URL
          }/verify-payment`,
          channels: [
            "card",
            "bank",
            "ussd",
            "qr",
            "mobile_money",
            "bank_transfer",
          ],
          metadata: {
            custom_fields: [
              {
                display_name: "Payment Type",
                variable_name: "payment_type",
                value: "subscription",
              },
            ],
          },
        }),
      }
    );

    const data = await response.json();

    if (!data.status) {
      throw new Error(data.message || "Payment initialization failed");
    }

    return NextResponse.json({
      reference: data.data.reference,
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
    });
  } catch (error: unknown) {
    console.error("Paystack initialization error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "An error occurred while initializing payment";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
