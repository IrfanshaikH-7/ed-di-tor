import { create } from 'zustand';

interface TerminalState {
  output: string;
  setOutput: (output: string) => void;
  clearOutput: () => void;
}

export const useTerminalStore = create<TerminalState>((set) => ({
  output: '',
  setOutput: (output) => set({ output }),
  clearOutput: () => set({ output: '' }),
})); 