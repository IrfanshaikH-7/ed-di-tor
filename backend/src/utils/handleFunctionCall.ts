import { Content, Part, GoogleGenAI, FunctionCallingConfigMode } from '@google/genai';
import { toolHandlers } from '../agent/tools/handler';

export async function handleFunctionCall({
  functionCalls,
  prompt,
  ai,
  addDeclaration,
  getDsaProblemsDeclaration,
}: {
  functionCalls: any[];
  prompt: string;
  ai: GoogleGenAI;
  addDeclaration: any;
  getDsaProblemsDeclaration: any;
}): Promise<any> {
  const call = functionCalls[0];
  if (call && typeof call.name === 'string') {
    const tool = toolHandlers[call.name];
    if (tool) {
      const { handler, direct } = tool;
      const isDirect = call.args && typeof call.args.direct === 'boolean' ? call.args.direct : direct;
      const result = await handler(call.args, prompt, ai);
      if (isDirect) {
        return { type: 'json', ...result };
      } else {
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