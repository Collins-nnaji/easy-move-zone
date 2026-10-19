import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** shadcn's class combiner: clsx for conditionals, twMerge to dedupe utilities. */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
