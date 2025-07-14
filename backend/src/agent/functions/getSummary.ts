import { getSessionSummary } from '../agent';

export async function getSummaryHandler(args: any, prompt: string, ai: any, sessionId?: string) {
  const summary = sessionId ? getSessionSummary(sessionId) : '[No summary available]';
  return summary || '[No summary available]';
} 