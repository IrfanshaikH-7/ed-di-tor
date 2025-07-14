import { create } from 'zustand';

interface TerminalState {
  output: string;
  error: string;
  setOutput: (output: string) => void;
  setError: (error: string) => void;
  clearOutput: () => void;
}

export const useTerminalStore = create<TerminalState>((set) => ({
  output: '',
  error: '',
  setOutput: (output) => set({ output }),
  setError: (error) => set({ error }),
  clearOutput: () => set({ output: '', error: '' }),
})); 