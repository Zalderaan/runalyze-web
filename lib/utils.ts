import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function humanize(str: string) {
  if (!str) return str;
  return str
    .replace(/^[-_]+|[-_]+$/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/[A-Z]/g, " $&")
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

