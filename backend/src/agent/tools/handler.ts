import { GoogleGenAI } from "@google/genai";
import { addHandler } from "../functions/add";
import { generateTestCasesHandler } from "../functions/generateTestCases";
import { getDsaProblemsHandler } from "../functions/getDsaProblems";
import { verifyTestCasesHandler } from "../functions/verifyTestCases";

export const toolHandlers: Record<string, { handler: (args: any, prompt: string, ai: GoogleGenAI) => Promise<any>, direct: boolean }> = {
    add: { handler: addHandler, direct: false },
    get_dsa_problems: { handler: getDsaProblemsHandler, direct: true },
    generate_test_cases: { handler: generateTestCasesHandler, direct: true },
    verify_test_cases: { handler: verifyTestCasesHandler, direct: true },
  };