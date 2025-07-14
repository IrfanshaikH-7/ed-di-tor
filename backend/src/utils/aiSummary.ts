import { GoogleGenAI } from '@google/genai';

export async function getAiSummary({
  prevSummary = '',
  userPrompt = '',
  resultObj,
  ai,
  model = 'gemini-2.5-flash-preview-05-20',
}: {
  prevSummary?: string;
  userPrompt: string;
  resultObj: any;
  ai: GoogleGenAI;
  model?: string;
}): Promise<string> {
  // Calculate botResponse from resultObj
  let botResponse = '[No response]';
  if (resultObj) {
    if (resultObj.type === 'json' && resultObj.completion) {
      botResponse = resultObj.completion;
    } else if (resultObj.type === 'text' && resultObj.text) {
      botResponse = resultObj.text;
    }
  }
  // Build the summary prompt inside the util
  const summaryPrompt = [
    prevSummary ? `Previous summary: ${prevSummary}` : '',
    `User: ${userPrompt}`,
    `Bot: ${botResponse}`,
    'Summarize the conversation so far in one sentence. if looks sammry might get bigger  Use a hard limit of 40 words. important: no more then 40 words of summary '
  ].filter(Boolean).join('\n');

  if (!ai) throw new Error('No AI client provided for summarization.');
  const summaryRes = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text: summaryPrompt }] }],
  });
  return summaryRes.text || '[No summary available]';
} 