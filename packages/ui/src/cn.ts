import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * The design system's font-size steps.
 *
 * tailwind-merge only knows Tailwind's stock sizes (`text-xs` … `text-9xl`).
 * Every other `text-*` it sees is assumed to be a colour, so an unregistered
 * `text-headline-sm` landed in the same conflict group as `text-cacao` — and
 * whichever came last won, silently deleting the other.
 *
 * That was not theoretical: the order tracker rendered
 * `font-label uppercase text-cacao` with its size stripped, because the class
 * list was `cn("... text-label-caps uppercase", done && "text-cacao")`.
 *
 * Keep this in step with the `--text-*` tokens in `globals.css`.
 */
const FONT_SIZES = [
  "display-hero",
  "headline-lg",
  "headline-md",
  "headline-sm",
  "body-lg",
  "body-md",
  "body-sm",
  "label-caps",
  "label-md",
  "label-sm",
];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: FONT_SIZES }],
    },
  },
});

/**
 * Merge Tailwind classes so a caller's override wins over a component's default
 * instead of both landing in the class list and letting source order decide.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
