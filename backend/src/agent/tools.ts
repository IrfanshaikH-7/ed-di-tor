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

export const toolDeclarations = {
  add: addDeclaration,
  get_dsa_problems: getDsaProblemsDeclaration,
}; 