import { GoogleGenAI } from '@google/genai';
import { generateTestCasesHandler } from './generateTestCases';
import { setStatus } from '../../sockets/statusServer';

export async function getDsaProblemsHandler(args: { topic: string; count: number; prompt?: string }, prompt: string, ai: GoogleGenAI) {
  setStatus('making questions');
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
    setStatus('failed');
    return { error: 'Failed to parse Gemini output as JSON', raw: genResponse.text };
  }

  // Chain: Automatically generate test cases for all problems
  console.log('Generating test cases for all problems...');
  const testCasesResponse = await generateTestCasesHandler(
    { problems: problems, count: 5 }, 
    prompt, 
    ai
  );

  // Combine problems with their test cases
  const problemsWithTestCases = problems.map((problem: any, index: number) => {
    const testCases = testCasesResponse.results[index] || [];
    return {
      ...problem,
      testCases: testCases
    };
  });

  setStatus('done');
  return { 
    problems: problemsWithTestCases
  };
} 