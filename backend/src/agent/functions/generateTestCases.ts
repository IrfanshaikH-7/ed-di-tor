import { GoogleGenAI } from '@google/genai';
import { verifyTestCasesHandler } from './verifyTestCases';
import { setStatus } from '../../sockets/statusServer';

export async function generateTestCasesHandler(args: { problems: any[]; count?: number }, prompt: string, ai: GoogleGenAI) {
  const count = args.count ?? 5;
  const results = [];

  // Process each problem and generate test cases
  for (const problem of args.problems) {
    setStatus('generating_test_cases');
    console.log(`Generating test cases for problem: ${problem.title}`);

    let testCases = [];
    let attempts = 0;
    const maxAttempts = 3; // Increased for verification retries

    while (testCases.length === 0 && attempts < maxAttempts) {
      attempts++;
      if (attempts > 1) {
        setStatus(`retrying test cases ${attempts}`);
      }
      console.log(`Attempt ${attempts} for "${problem.title}"`);

      // Construct prompt for Gemini to generate test cases for this specific problem
      let genPrompt = `Generate exactly ${count} test cases for this DSA problem:

Problem Title: ${problem.title}
Problem Statement: ${problem.statement}

Existing Examples:
${problem.examples.map((ex: any, i: number) =>
        `Example ${i + 1}:
  Input: ${ex.input}
  Output: ${ex.output}
  Explanation: ${ex.explanation}`
      ).join('\n\n')}

Generate exactly ${count} test cases:
- 2 test cases should be EXACTLY the same as the problem examples above (convert them to proper JSON objects)
- ${count - 2} additional cases (mix of edge cases, boundary conditions, and special cases)

Each test case should have:
- input: A proper JSON object with the input parameters (not a string)
- output: The expected output (can be number, string, array, etc.) - MUST be correct!
- explanation: Brief explanation of what this test case validates
- type: One of "example", "edge", "boundary", or "special"

CRITICAL: Before returning, verify that your expected outputs are mathematically/logically correct for the given inputs. If you're unsure about a calculation, use simpler test cases.

For the first 2 test cases, use the exact same inputs and outputs as the problem examples, but convert them to proper JSON objects.

For example, if the problem takes an array and a target, the input should be:
{ "nums": [1,2,3,4], "target": 7 }

NOT a string like "nums = [1,2,3,4], target = 7"

Return a JSON array of exactly ${count} test cases, no extra text, no explanation, just the array.`;

      // If this is a retry after verification failed, add the issues to the prompt
      if (attempts > 1) {
        genPrompt += `\n\nIMPORTANT: Previous test cases had issues. Please be extra careful and double-check all calculations.`;
      }

      console.log(`Prompt to Gemini for test cases of "${problem.title}":`, genPrompt);

      const genResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-05-20',
        contents: [{ role: 'user', parts: [{ text: genPrompt }] }],
      });

      // Log the raw Gemini output for debugging
      console.log(`Raw Gemini output for test cases of "${problem.title}":`, genResponse.text);

      try {
        let raw = genResponse.text || '[]';
        // Remove Markdown code block if present
        raw = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
        testCases = JSON.parse(raw);
        console.log(`Parsed test cases for "${problem.title}":`, testCases, 'Type:', typeof testCases, 'IsArray:', Array.isArray(testCases));

        // Validate test cases - check if they make sense
        if (Array.isArray(testCases) && testCases.length > 0) {
          console.log(`Validating ${testCases.length} test cases for "${problem.title}"...`);
          // Basic validation: check if input/output structure is correct
          const validTestCases = testCases.filter((tc: any) => {
            return tc && typeof tc === 'object' &&
              tc.input && typeof tc.input === 'object' &&
              tc.output !== undefined &&
              tc.explanation && tc.type;
          });

          if (validTestCases.length !== testCases.length) {
            console.warn(`Some test cases for "${problem.title}" failed validation, retrying...`);
            testCases = [];
            continue;
          }

          // Additional validation: check if we have the right number of test cases
          if (testCases.length !== count) {
            console.warn(`Expected ${count} test cases for "${problem.title}", got ${testCases.length}, retrying...`);
            testCases = [];
            continue;
          }

          console.log(`Verifying test cases for "${problem.title}"...`);
          setStatus(`verifing test cases for ...`)
          const verificationResult = await verifyTestCasesHandler(
            { problem: problem, testCases: testCases },
            prompt,
            ai
          );

          if (!verificationResult.isValid) {
            // If verification failed, add the issues to the prompt for the next attempt
            if (attempts < maxAttempts) {
              setStatus('retrying_test_cases');
              genPrompt += `\n\nPREVIOUS ATTEMPT FAILED VERIFICATION. Issues found:
${verificationResult.issues.map((issue: string, i: number) => `${i + 1}. ${issue}`).join('\n')}

Please regenerate test cases and fix these issues. Be extremely careful with calculations and logic.`;
              testCases = [];
              continue;
            } else {
              console.error(`Failed to generate valid test cases for "${problem.title}" after ${maxAttempts} attempts.`);
              // Return the test cases anyway, but mark them as potentially incorrect
              testCases = validTestCases;
            }
          } else {
            console.log(`Test cases for "${problem.title}" passed verification!`);
          }
        } else {
          console.warn(`No valid test cases generated for "${problem.title}", retrying...`);
          testCases = [];
          continue;
        }
      } catch (err) {
        console.error(`Failed to parse Gemini output as JSON for "${problem.title}":`, err);
        console.error('Gemini output was:', genResponse.text);
        testCases = [];
        continue;
      }
    }

    // Add the result for this problem
    results.push(testCases);
  }

  return { results };
} 