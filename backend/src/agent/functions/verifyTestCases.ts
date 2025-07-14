import { GoogleGenAI } from '@google/genai';

export async function verifyTestCasesHandler(args: { problem: any; testCases: any[] }, prompt: string, ai: GoogleGenAI) {
  // Construct prompt for Gemini to verify test cases
  const genPrompt = `You are a test case verification expert. Check if the test cases are correct for this DSA problem.

Problem Title: ${args.problem.title}
Problem Statement: ${args.problem.statement}

Test Cases to Verify:
${args.testCases.map((tc: any, i: number) => 
  `Test Case ${i + 1}:
  Input: ${JSON.stringify(tc.input)}
  Expected Output: ${tc.output}
  Type: ${tc.type}`
).join('\n\n')}

Your task:
1. Check if each expected output is mathematically/logically correct for the given input
2. If ALL test cases are correct, return isValid: true and issues: []
3. If ANY test case is incorrect, return isValid: false and list the issues in the issues array

Return a JSON object with:
- isValid: true/false
- issues: array of strings describing any problems found (empty if all correct)

Return only the JSON object, no extra text.`;

  
  const genResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-05-20',
    contents: [{ role: 'user', parts: [{ text: genPrompt }] }],
  });

  // Log the raw Gemini output for debugging

  let verificationResult;
  try {
    let raw = genResponse.text || '{}';
    // Remove Markdown code block if present
    raw = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
    verificationResult = JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse verification output as JSON:', err);
    console.error('Gemini output was:', genResponse.text);
    return { 
      isValid: false,
      issues: ['Verification failed - could not parse response']
    };
  }

  return verificationResult;
} 