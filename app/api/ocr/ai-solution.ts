import { NextRequest, NextResponse } from "next/server";

// This is required to avoid CORS issues
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { questionText, options } = await request.json();

    // Check if required fields exist
    if (!questionText || !options) {
      return NextResponse.json(
        { error: "Missing question text or options" },
        { status: 400 }
      );
    }

    // Construct the prompt for DeepSeek
    const prompt = `
      Question: ${questionText}
      
      Options:
      ${options
        .map(
          (opt: string, idx: number) =>
            `${String.fromCharCode(65 + idx)}. ${opt}`
        )
        .join("\n")}
      
      Please provide:
      1. A detailed explanation of the concept
      2. The correct answer (just the option letter: A, B, C, or D)
      3. Step-by-step reasoning
      4. Why other options are incorrect
      
      Format your response as a JSON object with these keys:
      - explanation: string (detailed explanation)
      - correctAnswer: string (just the letter like "A", "B", etc.)
      - reasoning: string (step-by-step reasoning)
      - stepByStep: array of strings (if needed)
      
      IMPORTANT: Respond ONLY with valid JSON, no additional text.
    `;

    const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;

    if (!apiKey) {
      console.error("DEEPSEEK_API_KEY is not configured");
      return NextResponse.json(
        { error: "AI service is not configured" },
        { status: 500 }
      );
    }

    console.log("Calling DeepSeek API with prompt length:", prompt.length);

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful educational assistant. Provide clear, structured explanations for exam questions. ALWAYS respond with ONLY valid JSON, no additional text.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: "json_object" }, // This helps ensure JSON response
      }),
    });

    console.log("DeepSeek API Response Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API Error:", errorText);
      return NextResponse.json(
        { error: `DeepSeek API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("DeepSeek API Success, received response");

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Server API route error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
