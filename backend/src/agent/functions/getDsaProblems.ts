import { GoogleGenAI } from '@google/genai';
import { generateTestCasesHandler } from './generateTestCases';
import { setStatus } from '../../sockets/statusServer';

export async function getDsaProblemsHandler(args: { topic: string; count: number; prompt?: string }, prompt: string, ai: GoogleGenAI) {
  setStatus('Generating questions');
  // Combine topic, count, and user prompt for Gemini
  let genPrompt = `Generate ${args.count} DSA problems on the topic "${args.topic}".`;
  if (args.prompt && args.prompt.trim()) {
    genPrompt += ` ${args.prompt.trim()}`;
  }
  genPrompt += `\nReturn a JSON object with two fields:\n- problems: a JSON array of problems, each with fields: title, statement (HTML allowed), and two examples (input, output, explanation, all HTML allowed)\n- completion: a single line string summarizing what was generated, e.g. \"Generated 3 DSA problems on arrays.\"\nNo extra text, no explanation, just the JSON object.`;

  const genResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-05-20',
    contents: [{ role: 'user', parts: [{ text: genPrompt }] }],
  });

  // Log the raw Gemini output for debugging

  let problems;
  let completion = '';
  try {
    let raw = genResponse.text || '{}';
    // Remove Markdown code block if present
    raw = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
    const parsed = JSON.parse(raw);
    problems = parsed.problems;
    completion = parsed.completion || '';
  } catch (err) {
    console.error('Failed to parse Gemini output as JSON:', err);
    console.error('Gemini output was:', genResponse.text);
    setStatus('Failed');
    return { error: 'Failed to parse Gemini output as JSON', raw: genResponse.text };
  }

  // Chain: Automatically generate test cases for all problems
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

  setStatus('Done');
  return { 
    problems: problemsWithTestCases,
    completion,
    tool:'get_problems'
  };
} 