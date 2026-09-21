import { 
  DamageAnalyzeResponse, 
  DamageComparisonResult, 
  ShopkeeperInsight, 
  DamageFinding, 
  ImageAngle 
} from "../types/ai";

export async function fetchHealth() {
  try {
    const res = await fetch("/api/health");
    if (!res.ok) throw new Error("Health check failed");
    return await res.json();
  } catch {
    return { status: "offline", mode: "mock", model: "gemini-2.5-flash" };
  }
}

export async function analyzeDamagePhotos(
  bookingId: string,
  phase: "pickup" | "return",
  vehicleType: string,
  images: Array<{ angle: ImageAngle; file: File }>
): Promise<DamageAnalyzeResponse> {
  const formData = new FormData();
  formData.append("bookingId", bookingId);
  formData.append("phase", phase);
  formData.append("vehicleType", vehicleType);

  images.forEach((item) => {
    formData.append("images", item.file);
    formData.append("angles", item.angle);
  });

  const res = await fetch("/api/ai/damage/analyze", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: { message: "Analysis request failed" } }));
    throw new Error(errData.error?.message || "Failed to analyze damage photos");
  }

  return await res.json();
}

export async function compareDamageFindings(
  bookingId: string,
  pickupFindings: DamageFinding[],
  returnFindings: DamageFinding[]
): Promise<DamageComparisonResult> {
  const res = await fetch("/api/ai/damage/compare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookingId, pickupFindings, returnFindings }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: { message: "Comparison request failed" } }));
    throw new Error(errData.error?.message || "Failed to compare damage findings");
  }

  return await res.json();
}

export async function fetchAiInsights(shopId: string, aggregates: any): Promise<ShopkeeperInsight[]> {
  const res = await fetch("/api/ai/insights", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ shopId, aggregates }),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch AI insights");
  }

  return await res.json();
}

export async function streamAssistantReply(
  prompt: string,
  history: Array<{ role: string; text: string }>,
  onChunk: (chunk: string) => void
): Promise<void> {
  const res = await fetch("/api/ai/assist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, history }),
  });

  if (!res.ok || !res.body) {
    throw new Error("Failed to connect to AI assistant");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let done = false;

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;
    if (value) {
      const text = decoder.decode(value, { stream: true });
      const lines = text.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const dataStr = line.replace("data: ", "").trim();
          if (dataStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.text) onChunk(parsed.text);
          } catch {
            // Ignore parse errors for partial chunks
          }
        }
      }
    }
  }
}
