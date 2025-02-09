import { ReleaseType } from "../../types/database";

export function formatReleaseType(type: ReleaseType): string {
  switch (type) {
    case "LP":
      return "LP";
    case "EP":
      return "EP";
    case "Single":
      return "Single";
    case "Compilation":
      return "Compilation";
    default:
      return type;
  }
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDuration(ms: number | null | undefined): string {
  if (!ms) return "";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}