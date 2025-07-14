import { GoogleGenAI, FunctionCallingConfigMode, Content, Part } from '@google/genai';
import { addDeclaration, getDsaProblemsDeclaration, generateTestCasesDeclaration, verifyTestCasesDeclaration, getSummaryDeclaration } from './tools/tools';
import { getAiSummary } from '../utils/aiSummary';
import { handleFunctionCall } from '../utils/handleFunctionCall';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Simple in-memory summary store
const sessionSummaries: Record<string, string> = {};

export async function handlePrompt(prompt: string, sessionId?: string) {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set in environment.');
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const systemInstruction = `You are a skilled and friendly DSA tutor AI. Your job is to help students understand concepts deeply through clear, conversational explanations, and by guiding their thought process step by step.

🧠 Always explain concepts yourself using logic, analogies, and simple examples. Stay in teaching mode — do not use tools by default.
Help students build their problem-solving thought process and learn how to approach similar types of questions on their own.
❗ Only use tools when absolute nessary as for questions generations do it only if the student explicitly uses one of these phrases:
“Give me questions”
“Generate questions”`;
  const contents = [
    { role: 'user', parts: [{ text: `${systemInstruction}\n\n${prompt}` }] } as Content,
  ];

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-05-20',
    contents,
    config: {
      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingConfigMode.AUTO,
        },
      },
      tools: [
        { functionDeclarations: [addDeclaration, getDsaProblemsDeclaration, generateTestCasesDeclaration, verifyTestCasesDeclaration, getSummaryDeclaration] },
      ],
    },
  });

  // Dynamic tool dispatch
  const functionCalls = response.functionCalls;
  let resultObj;
  if (functionCalls && functionCalls.length > 0) {
    resultObj = await handleFunctionCall({
      functionCalls,
      prompt,
      ai,
      addDeclaration,
      getDsaProblemsDeclaration,
    });
  } else {
    resultObj = { type: 'text', text: response.text || 'No response from Gemini.' };
  }

  // Store summary if sessionId is provided
  if (sessionId) {
    const prevSummary = sessionSummaries[sessionId] || '';
    const summary = await getAiSummary({
      prevSummary,
      userPrompt: prompt,
      resultObj,
      ai,
    });
    sessionSummaries[sessionId] = summary;
    console.log('summary', summary)
    console.log('summary')
  }

  return resultObj;
}

export function getSessionSummary(sessionId: string): string | undefined {
  return sessionSummaries[sessionId];
} 