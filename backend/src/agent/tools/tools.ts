import { Type, FunctionDeclaration } from '@google/genai';

export const addDeclaration: FunctionDeclaration = {
  name: 'add',
  description: 'Add two numbers. Only use this tool if the user asks for addition or math.',
  parameters: {
    type: Type.OBJECT,
    description: 'Add two numbers',
    properties: {
      a: { type: Type.NUMBER, description: 'First number' },
      b: { type: Type.NUMBER, description: 'Second number' },
    },
    required: ['a', 'b'],
  },
};

export const getDsaProblemsDeclaration: FunctionDeclaration = {
  name: 'get_dsa_problems',
  description: 'Get a list of DSA (Data Structures and Algorithms) problems for a given topic and count, or use a custom prompt. Always return a JSON array of problems, each with a title, statement (with HTML formatting, bold, and code blocks), and two examples (input, output, explanation) with HTML formatting.',
  parameters: {
    type: Type.OBJECT,
    description: 'Get DSA problems by topic and count, or by a custom prompt',
    properties: {
      topic: { type: Type.STRING, description: 'The DSA topic, e.g., array, string, tree, etc.' },
      count: { type: Type.NUMBER, description: 'Number of problems to return (e.g., 3)' },
      prompt: { type: Type.STRING, description: 'Optional: The full user prompt describing the desired problems. If provided, overrides topic/count.' },
    },
    required: ['topic', 'count'],
  },
  response: {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: 'Problem title' },
        statement: { type: Type.STRING, description: 'Problem statement (HTML allowed)' },
        examples: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              input: { type: Type.STRING, description: 'Example input (HTML allowed)' },
              output: { type: Type.STRING, description: 'Example output (HTML allowed)' },
              explanation: { type: Type.STRING, description: 'Short explanation' }
            },
            required: ['input', 'output', 'explanation']
          }
        }
      },
      required: ['title', 'statement', 'examples']
    }
  }
};

export const generateTestCasesDeclaration: FunctionDeclaration = {
  name: 'generate_test_cases',
  description: 'Generate test cases for multiple DSA problems. Takes an array of problems and generates 8 test cases for each problem, using their statements and existing examples.',
  parameters: {
    type: Type.OBJECT,
    description: 'Generate test cases for multiple DSA problems',
    properties: {
      problems: { 
        type: Type.ARRAY, 
        description: 'Array of DSA problem objects with title, statement, and examples',
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            statement: { type: Type.STRING },
            examples: { 
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  input: { type: Type.STRING },
                  output: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                }
              }
            }
          }
        }
      },
      count: { 
        type: Type.NUMBER, 
        description: 'Number of test cases to generate per problem (default: 8)' 
      },
    },
    required: ['problems'],
  },
  response: {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        problemTitle: { type: Type.STRING, description: 'Title of the problem these test cases belong to' },
        testCases: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              input: { type: Type.STRING, description: 'Test case input' },
              output: { type: Type.STRING, description: 'Expected output' },
              explanation: { type: Type.STRING, description: 'Brief explanation of the test case' },
              type: { type: Type.STRING, description: 'Type of test case (edge case, normal case, boundary case, etc.)' }
            },
            required: ['input', 'output', 'explanation', 'type']
          }
        }
      },
      required: ['problemTitle', 'testCases']
    }
  }
};

export const verifyTestCasesDeclaration: FunctionDeclaration = {
  name: 'verify_test_cases',
  description: 'Verify if test cases are correct for a DSA problem. Takes a problem and its test cases, checks if the expected outputs are correct, and returns true/false.',
  parameters: {
    type: Type.OBJECT,
    description: 'Verify test cases for a DSA problem',
    properties: {
      problem: { 
        type: Type.OBJECT, 
        description: 'The DSA problem object with title, statement, and examples' 
      },
      testCases: { 
        type: Type.ARRAY, 
        description: 'Array of test cases to verify',
        items: {
          type: Type.OBJECT,
          properties: {
            input: { type: Type.OBJECT, description: 'Test case input' },
            output: { type: Type.STRING, description: 'Expected output' },
            explanation: { type: Type.STRING, description: 'Explanation of the test case' },
            type: { type: Type.STRING, description: 'Type of test case' }
          }
        }
      },
    },
    required: ['problem', 'testCases'],
  },
  response: {
    type: Type.OBJECT,
    properties: {
      isValid: { type: Type.BOOLEAN, description: 'Whether all test cases are correct' },
      issues: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'List of issues found (empty if all correct)' }
    }
  }
};

export const toolDeclarations = {
  add: addDeclaration,
  get_dsa_problems: getDsaProblemsDeclaration,
  generate_test_cases: generateTestCasesDeclaration,
  verify_test_cases: verifyTestCasesDeclaration,
}; 