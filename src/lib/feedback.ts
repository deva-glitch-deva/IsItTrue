export interface AnonymousFeedback {
  resultId: string;
  verdict: string;
  note?: string;
  createdAt: string;
}

type GlobalFeedback = typeof globalThis & {
  __isItTrueFeedback?: AnonymousFeedback[];
};

const globalFeedback = globalThis as GlobalFeedback;

function store(): AnonymousFeedback[] {
  if (!globalFeedback.__isItTrueFeedback) {
    globalFeedback.__isItTrueFeedback = [];
  }
  return globalFeedback.__isItTrueFeedback;
}

export function logFeedback(input: {
  resultId: string;
  verdict: string;
  note?: string;
}): AnonymousFeedback {
  const item: AnonymousFeedback = {
    resultId: input.resultId.slice(0, 120),
    verdict: input.verdict.slice(0, 32),
    note: input.note?.slice(0, 280),
    createdAt: new Date().toISOString(),
  };
  const items = store();
  items.push(item);
  if (items.length > 500) items.splice(0, items.length - 500);
  return item;
}

export function feedbackCount(): number {
  return store().length;
}
