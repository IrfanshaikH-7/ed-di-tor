import { GoogleGenAI } from '@google/genai';

export async function getDsaProblemsHandler(args: { topic: string; count: number; prompt?: string }, prompt: string, ai: GoogleGenAI) {
  // Combine topic, count, and user prompt for Gemini
  let genPrompt = `Generate ${args.count} DSA problems on the topic "${args.topic}".`;
  if (args.prompt && args.prompt.trim()) {
    genPrompt += ` ${args.prompt.trim()}`;
  }
  genPrompt += ` Each problem should be a JSON object with fields: title, statement (HTML allowed), and two examples (input, output, explanation, all HTML allowed). Return a JSON array, no extra text, no explanation, just the array.`;

  console.log('Prompt to Gemini:', genPrompt);
  const genResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-05-20',
    contents: [{ role: 'user', parts: [{ text: genPrompt }] }],
  });

  // Log the raw Gemini output for debugging
  console.log('Raw Gemini output:', genResponse.text);

  let problems;
  try {
    let raw = genResponse.text || '[]';
    // Remove Markdown code block if present
    raw = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
    problems = JSON.parse(raw);
    console.log('Parsed problems:', problems, 'Type:', typeof problems, 'IsArray:', Array.isArray(problems));
  } catch (err) {
    console.error('Failed to parse Gemini output as JSON:', err);
    console.error('Gemini output was:', genResponse.text);
    return { error: 'Failed to parse Gemini output as JSON', raw: genResponse.text };
  }

  return { problems };
} 