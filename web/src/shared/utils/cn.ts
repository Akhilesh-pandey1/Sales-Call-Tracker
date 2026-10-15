import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  const mergedClassNames: string = twMerge(clsx(inputs));
  return mergedClassNames;
}
