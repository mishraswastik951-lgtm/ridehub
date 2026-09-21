import { GoogleGenAI } from "@google/genai";
import { config } from "../config";
import pino from "pino";

const logger = pino({ name: "gemini-client" });

let genAI: GoogleGenAI | null = null;
if (config.geminiApiKey) {
  genAI = new GoogleGenAI({ apiKey: config.geminiApiKey });
}

interface CallGeminiOptions {
  prompt: string;
  systemInstruction?: string;
  images?: Array<{ buffer: Buffer; mimeType: string }>;
  responseSchema?: any;
  temperature?: number;
}

export async function callGeminiJson<T>(options: CallGeminiOptions, mockFallback: () => T): Promise<T> {
  if (config.aiMode === "mock" || !genAI) {
    logger.info("Using mock AI response (AI_MODE=mock)");
    await new Promise((resolve) => setTimeout(resolve, 1200 + Math.random() * 800));
    return mockFallback();
  }

  const maxRetries = 2;
  let delay = 1000;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      logger.info({ attempt: attempt + 1, model: config.geminiModel }, "Calling Gemini API");

      const contents: any[] = [options.prompt];
      if (options.images && options.images.length > 0) {
        options.images.forEach((img) => {
          contents.push({
            inlineData: {
              data: img.buffer.toString("base64"),
              mimeType: img.mimeType,
            },
          });
        });
      }

      const response = await genAI.models.generateContent({
        model: config.geminiModel,
        contents,
        config: {
          systemInstruction: options.systemInstruction,
          temperature: options.temperature ?? 0.1,
          responseMimeType: "application/json",
          responseSchema: options.responseSchema,
        },
      });

      const text = response.text || "";
      return JSON.parse(text) as T;
    } catch (err: any) {
      logger.warn({ err: err.message, attempt: attempt + 1 }, "Gemini API call failed");
      if (attempt === maxRetries) {
        logger.error("All Gemini API retries exhausted. Falling back to mock fixture.");
        return mockFallback();
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }

  return mockFallback();
}

export async function* streamGeminiAssistant(prompt: string, history: Array<{ role: string; text: string }> = []): AsyncGenerator<string> {
  if (config.aiMode === "mock" || !genAI) {
    const mockReply = `Hello! I am the RideHub AI Assistant. In RideHub, security deposits are 100% refundable upon vehicle handover. If you cancel before 25% of your trip duration, you get a 100% rental refund. How can I help you today?`;
    const words = mockReply.split(" ");
    for (const word of words) {
      await new Promise((resolve) => setTimeout(resolve, 60));
      yield word + " ";
    }
    return;
  }

  try {
    const responseStream = await genAI.models.generateContentStream({
      model: config.geminiModel,
      contents: [prompt],
      config: {
        systemInstruction: `You are the RideHub AI Assistant. Ground your knowledge in RideHub's real platform rules (100%/50%/0% refund tiers, HubX plans, loyalty points, DigiLocker KYC). Refuse unrelated topics politely and say "I don't know" instead of guessing.`,
        temperature: 0.2,
      },
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (err: any) {
    logger.error({ err: err.message }, "Error streaming Gemini response");
    yield "I apologize, but I am currently having trouble processing your query. Please try again shortly.";
  }
}
