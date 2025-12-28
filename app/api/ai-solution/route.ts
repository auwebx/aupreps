import { NextRequest, NextResponse } from "next/server";

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

    // Get API key from environment
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      console.error(
        "DEEPSEEK_API_KEY is not configured in environment variables"
      );
      return NextResponse.json(
        { error: "AI service is not configured" },
        { status: 500 }
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
      
      IMPORTANT: Respond ONLY with valid JSON in this exact format:
      {
        "explanation": "Detailed explanation here",
        "correctAnswer": "A",
        "reasoning": "Step-by-step reasoning here",
        "stepByStep": ["Step 1", "Step 2", "Step 3"]
      }
      
      Do not include any other text outside the JSON.
    `;

    console.log("Calling DeepSeek API with prompt length:", prompt.length);

    const response = await fetch(
      "https://api.deepseek.com/v1/chat/completions",
      {
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
                "You are a helpful educational assistant. Provide clear, structured explanations for exam questions. ALWAYS respond with ONLY valid JSON in the exact format requested, no additional text.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 1500,
          response_format: { type: "json_object" },
        }),
      }
    );

    console.log("DeepSeek API Response Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API Error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText.substring(0, 200),
      });

      // Return a mock response for testing if API fails
      return NextResponse.json({
        choices: [
          {
            message: {
              content: JSON.stringify({
                explanation:
                  "This is a sample explanation. The DeepSeek API is currently unavailable.",
                correctAnswer: "A",
                reasoning: "Based on the context provided...",
                stepByStep: [
                  "Analyze the question structure",
                  "Evaluate each option systematically",
                  "Identify the most accurate answer",
                ],
              }),
            },
          },
        ],
      });
    }

    const data = await response.json();
    console.log("DeepSeek API Success, received response");

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Server API route error:", error);

    const message = error instanceof Error ? error.message : "Unknown error";

    // Return a mock response for testing
    return NextResponse.json({
      choices: [
        {
          message: {
            content: JSON.stringify({
              explanation: "Error processing request: " + message,
              correctAnswer: "",
              reasoning: "",
              stepByStep: [] as string[],
            }),
          },
        },
      ],
    });
  }
}
