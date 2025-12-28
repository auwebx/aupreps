// app/api/paystack/verify/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { success: false, error: "Payment reference not provided" },
        { status: 400 }
      );
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      return NextResponse.json(
        { success: false, error: "Payment service not configured" },
        { status: 500 }
      );
    }

    // Verify payment with Paystack
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!data.status) {
      return NextResponse.json(
        {
          success: false,
          error: data.message || "Payment verification failed",
        },
        { status: 400 }
      );
    }

    // Check if payment was successful
    if (data.data.status !== "success") {
      return NextResponse.json(
        {
          success: false,
          error: `Payment status: ${data.data.status}`,
        },
        { status: 400 }
      );
    }

    // Return successful verification
    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      reference: data.data.reference,
      amount: data.data.amount, // Amount in kobo
      paid_at: data.data.paid_at,
      channel: data.data.channel,
      customer: {
        email: data.data.customer.email,
        customer_code: data.data.customer.customer_code,
      },
    });
  } catch (error: unknown) {
    console.error("Paystack verification error:", error);

    const message =
      error instanceof Error ? error.message : "Verification failed";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
