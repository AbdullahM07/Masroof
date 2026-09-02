import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Merge Tailwind classes safely (later classes win).
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
