import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Question {
  title: string;
  statement: string;
  examples: Array<{
    input: string;
    output: string;
    explanation: string;
  }>;
  testCases?: Array<any>;
}

interface QuestionsState {
  questions: Question[];
  updateQuestions: (questions: Question[]) => void;
  clearQuestions: () => void;
}

export const useQuestionsStore = create<QuestionsState>()(
  persist(
    (set) => ({
      questions: [],
      updateQuestions: (questions) => set({ questions }),
      clearQuestions: () => set({ questions: [] }),
    }),
    {
      name: 'questions-storage', // key in localStorage
    }
  )
);

export const getQuestions = (state: QuestionsState) => state.questions; 