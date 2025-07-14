import { GoogleGenAI, FunctionCallingConfigMode, Content, Part } from '@google/genai';
import { addDeclaration, getDsaProblemsDeclaration, generateTestCasesDeclaration, verifyTestCasesDeclaration } from './tools/tools';
import { toolHandlers } from './tools/handler';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function handlePrompt(prompt: string) {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set in environment.');
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-05-20',
    contents: [
      { role: 'user', parts: [{ text: prompt }] } as Content,
    ],
    config: {
      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingConfigMode.AUTO,
        },
      },
      tools: [
        { functionDeclarations: [addDeclaration, getDsaProblemsDeclaration, generateTestCasesDeclaration, verifyTestCasesDeclaration] },
      ],
    },
  });

  // Dynamic tool dispatch
  const functionCalls = response.functionCalls;
  if (functionCalls && functionCalls.length > 0) {
    const call = functionCalls[0];
    if (call && typeof call.name === 'string') {
      const tool = toolHandlers[call.name];
      if (tool) {
        const { handler, direct } = tool;
        // Prefer direct from args if present, else from map
        const isDirect = call.args && typeof call.args.direct === 'boolean' ? call.args.direct : direct;
        const result = await handler(call.args, prompt, ai);
        
        if (isDirect) {
          return { type: 'json', json: result };
        } else {
          // Send the function response back to Gemini for a conversational answer
          const followup = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-05-20',
            contents: [
              { role: 'user', parts: [{ text: prompt }] } as Content,
              { role: 'function', parts: [{ functionResponse: { name: call.name, response: result } } as unknown as Part] } as Content,
            ],
            config: {
              toolConfig: {
                functionCallingConfig: {
                  mode: FunctionCallingConfigMode.AUTO,
                },
              },
              tools: [
                { functionDeclarations: [addDeclaration, getDsaProblemsDeclaration] },
              ],
            },
          });
          return { type: 'text', text: followup.text || 'No response from Gemini.' };
        }
      } else {
        return { error: `Unknown tool: ${call.name}` };
      }
    } else {
      return { error: 'Invalid function call from Gemini.' };
    }
  }
  return { type: 'text', text: response.text || 'No response from Gemini.' };
} 