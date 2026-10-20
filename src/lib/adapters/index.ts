import { hasLLM, OpenAICompatibleLLM } from "./openai";
import { hasSearch, TavilySearchAdapter } from "./search";
import { hasSTT, OpenAISTTAdapter } from "./stt";
import { WikipediaSearchAdapter } from "./wikipedia";
import { MockLLMAdapter, MockSTTAdapter, MockSearchAdapter } from "./mock";
import type { LLMAdapter, SearchAdapter, STTAdapter } from "./types";
import type { ProviderStatus } from "../types";

export interface AdapterSet {
  llm: LLMAdapter | null;
  stt: STTAdapter | null;
  search: SearchAdapter | null;
  mock: {
    llm: LLMAdapter;
    stt: STTAdapter;
    search: SearchAdapter;
  };
  status: Omit<ProviderStatus, "cache">;
}

let cached: AdapterSet | null = null;

function wikipediaEnabled(): boolean {
  return (
    process.env.npm_lifecycle_event !== "test" &&
    process.env.NODE_ENV !== "test"
  );
}

export function getAdapters(): AdapterSet {
  if (cached) return cached;
  const liveSearch = hasSearch();
  const wiki = wikipediaEnabled();
  cached = {
    llm: hasLLM() ? new OpenAICompatibleLLM() : null,
    stt: hasSTT() ? new OpenAISTTAdapter() : null,
    search: liveSearch
      ? new TavilySearchAdapter()
      : wiki
        ? new WikipediaSearchAdapter()
        : null,
    mock: {
      llm: new MockLLMAdapter(),
      stt: new MockSTTAdapter(),
      search: new MockSearchAdapter(),
    },
    status: {
      ai: hasLLM() ? "live" : "mock",
      stt: hasSTT() ? "live" : "mock",
      search: liveSearch || wiki ? "live" : "mock",
    },
  };
  return cached;
}

export type { LLMAdapter, STTAdapter, SearchAdapter };
