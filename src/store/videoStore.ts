import { create } from "zustand";

type VideoState = {
  file: File | null;
  setFile: (file: File | null) => void;
};

export const useVideoStore = create<VideoState>((set) => ({
  file: null,
  setFile: (file) => set({ file }),
}));
