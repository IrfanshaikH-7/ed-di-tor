import { Content, Part, GoogleGenAI, FunctionCallingConfigMode } from '@google/genai';
import { addDeclaration, getDsaProblemsDeclaration } from '../tools';

export async function addHandler(args: { a: number; b: number; }) {
  console.log('toolcalll')
  const result = args.a + args.b;
  return { result };
} 