import { create } from "zustand";

interface LegalModalsState {
  termsOpen: boolean;
  privacyOpen: boolean;
  openTerms: () => void;
  closeTerms: () => void;
  openPrivacy: () => void;
  closePrivacy: () => void;
}

export const useLegalModals = create<LegalModalsState>((set) => ({
  termsOpen: false,
  privacyOpen: false,
  openTerms: () => set({ termsOpen: true }),
  closeTerms: () => set({ termsOpen: false }),
  openPrivacy: () => set({ privacyOpen: true }),
  closePrivacy: () => set({ privacyOpen: false }),
}));
