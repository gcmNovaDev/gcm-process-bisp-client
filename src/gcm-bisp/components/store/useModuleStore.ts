import { create } from "zustand";

interface ModuleState {
  name: string;
  description: string;
  setModule: (name: string, description: string) => void;
}

export const useModuleStore = create<ModuleState>((set) => ({
  name: "",
  description: "",
  setModule: (name, description) => set({ name, description }),
}));