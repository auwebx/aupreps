import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Send to OCR.Space
    const ocrForm = new FormData();
    ocrForm.append("file", new Blob([buffer]), file.name);
    ocrForm.append("apikey", process.env.OCR_SPACE_API_KEY!);
    ocrForm.append("language", "eng");

    const ocrRes = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: ocrForm,
    });

    const ocrData = await ocrRes.json();

    if (!ocrData?.ParsedResults?.[0]?.ParsedText) {
      return NextResponse.json({
        error: "OCR failed to extract text.",
      });
    }

    const rawText = ocrData.ParsedResults[0].ParsedText;

    // Clean text
    const cleaned = rawText
      .replace(/\r/g, "")
      .replace(/\n{2,}/g, "\n")
      .replace(/[^\S\r\n]+/g, " ")
      .trim();

    // Send to GPT-4o Mini for extracting exam questions
    const gptRes = await openai.responses.create({
      model: "gpt-4o-mini",
      input: `
        You are an expert in Nigerian exams (WAEC, JAMB, NECO).
        Extract all exam questions from this OCR text.

        Return ONLY JSON in this format:

        {
          "questions": [
            {
              "number": 1,
              "question": "",
              "options": {
                "A": "", "B": "", "C": "", "D": ""
              }
            }
          ]
        }

        If something is missing (like options), put empty strings.

        OCR TEXT:
        ${cleaned}
      `,
      max_output_tokens: 2000,
    });

    const content = gptRes.output_text || "{}";
    let json;

    try {
      json = JSON.parse(content);
    } catch {
      json = { questions: [], raw: cleaned };
    }

    return NextResponse.json(json);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Server error", details: String(error) },
      { status: 500 }
    );
  }
}
