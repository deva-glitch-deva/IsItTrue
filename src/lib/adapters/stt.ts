import type { STTAdapter, TranscribeInput, Transcription } from "./types";

export function hasSTT(): boolean {
  return Boolean(process.env.STT_API_KEY);
}

export class OpenAISTTAdapter implements STTAdapter {
  readonly name = "openai-stt";

  async transcribe(input: TranscribeInput): Promise<Transcription> {
    if (!process.env.STT_API_KEY) {
      throw new Error("No STT key configured.");
    }
    if (!input.buffer || !input.fileName) {
      throw new Error("No media supplied.");
    }

    const baseUrl = (process.env.STT_BASE_URL || "https://api.openai.com/v1").replace(
      /\/$/,
      "",
    );
    const model = process.env.STT_MODEL || "whisper-1";
    const form = new FormData();
    form.append(
      "file",
      new Blob([input.buffer], {
        type: input.mimeType || "application/octet-stream",
      }),
      input.fileName,
    );
    form.append("model", model);
    form.append("response_format", "json");

    const response = await fetch(`${baseUrl}/audio/transcriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.STT_API_KEY}` },
      body: form,
      signal: AbortSignal.timeout(70_000),
    });
    if (!response.ok) {
      throw new Error(`Transcription failed with ${response.status}.`);
    }
    const data = (await response.json()) as { text?: string };
    const text = data.text?.trim();
    if (!text) throw new Error("Transcription was empty.");
    return { text, demo: false };
  }
}
