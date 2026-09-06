/**
 * An image the design calls for. `src` stays null until a real asset lands in
 * `public/images`; `ImageSlot` then renders a labelled tonal block instead, so
 * layout stays reviewable and the gap is obvious rather than hidden behind
 * stock photography that misrepresents the product.
 *
 * Lives in its own module because both the landing copy and the product
 * catalogue use it, and importing one from the other would be circular.
 */
export interface ImageSlot {
  src: string | null;
  alt: string;
  /** Shown inside the placeholder block so it is obvious what belongs there. */
  note: string;
}
