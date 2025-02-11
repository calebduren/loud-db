import { ReleaseType } from "../types/database";

export const RELEASE_TYPES: readonly ReleaseType[] = [
  "single",
  "LP",
  "EP",
  "compilation",
] as const;

export const RELEASE_TYPE_LABELS: Record<ReleaseType | "all", string> = {
  all: "All",
  single: "Single",
  LP: "LP",
  EP: "EP",
  compilation: "Compilation",
};
