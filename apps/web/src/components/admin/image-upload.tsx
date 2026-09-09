"use client";

import { useId, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { ImageSlot } from "@/components/ui/image-slot";

/** Matches the `images` array element in `productSchema` — defined directly
 *  rather than derived from `ProductFormValues`, since that type's `images`
 *  is `T[] | undefined` (the schema's `.default([])` only applies on parse,
 *  not to the pre-parse input type) and would make every read here fight an
 *  unnecessary `undefined` check. */
interface ImageValue {
  url: string;
  alt: string;
  role: "hero" | "gallery";
}

const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp";
const MAX_IMAGES = 5;

/**
 * Real product photo upload — replaces the old decorative "Photography"
 * panel, whose boxes were static `<div>`s with no `<input type="file">`
 * anywhere in the codebase.
 *
 * Uploads go straight from this browser to Vercel Blob storage via
 * `POST /api/admin/uploads` issuing a short-lived token — see that route's
 * doc comment. The resulting URL is added to `images` immediately; nothing
 * is actually attached to a product until the surrounding form is saved.
 *
 * Kept as plain controlled state (not a `useFieldArray`) because nothing
 * here is a user-typed sub-field — each image is an opaque value swapped in
 * whole by an upload, a removal, or a "make hero" click.
 */
export function ImageUpload({
  images,
  onChange,
  disabled,
}: {
  images: ImageValue[];
  onChange: (images: ImageValue[]) => void;
  /** True when Blob storage isn't configured — see `isBlobStorageConfigured()`. */
  disabled?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const hero = images.find((image) => image.role === "hero") ?? images[0] ?? null;
  const gallery = images.filter((image) => image !== hero);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).slice(0, MAX_IMAGES - images.length);
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const uploaded: ImageValue[] = [];
      for (const file of files) {
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/admin/uploads",
        });
        uploaded.push({
          url: blob.url,
          alt: "",
          role: images.length === 0 && uploaded.length === 0 ? "hero" : "gallery",
        });
      }
      onChange([...images, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed — please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeAt = (target: ImageValue) => {
    const next = images.filter((image) => image !== target);
    // Promote the next image to hero if the hero itself was just removed.
    const [first, ...rest] = next;
    if (target.role === "hero" && first) {
      onChange([{ ...first, role: "hero" }, ...rest]);
    } else {
      onChange(next);
    }
  };

  const makeHero = (target: ImageValue) => {
    onChange(
      images.map((image) => ({ ...image, role: image === target ? "hero" : "gallery" })),
    );
  };

  return (
    <div>
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded border border-rule/70 bg-surface-container">
        {hero ? (
          <>
            <ImageSlot
              slot={{ src: hero.url, alt: hero.alt || "Hero image", note: "" }}
            />
            <button
              type="button"
              onClick={() => removeAt(hero)}
              className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-cacao/85 text-linen backdrop-blur-sm hover:bg-error"
            >
              <span className="sr-only">Remove hero image</span>
              <span aria-hidden="true">×</span>
            </button>
          </>
        ) : (
          <p className="font-label text-label-sm text-nutmeg/70 uppercase">Hero image</p>
        )}
      </div>

      <div className="mt-gutter-xs grid grid-cols-4 gap-gutter-xs">
        {gallery.map((image) => (
          <div
            key={image.url}
            className="relative flex aspect-square items-center justify-center overflow-hidden rounded border border-rule/70 bg-surface-container"
          >
            <ImageSlot
              slot={{ src: image.url, alt: image.alt || "Product photo", note: "" }}
            />
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-cacao/85 px-1 py-0.5 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => makeHero(image)}
                className="font-label text-[10px] text-linen uppercase hover:text-tertiary-fixed-dim"
              >
                Make hero
              </button>
              <button
                type="button"
                onClick={() => removeAt(image)}
                className="font-label text-[10px] text-linen uppercase hover:text-error"
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        {images.length < MAX_IMAGES && !disabled && (
          <label
            htmlFor={inputId}
            className="flex aspect-square cursor-pointer items-center justify-center rounded border border-dashed border-rule/70 font-label text-label-sm text-nutmeg/70 transition-colors hover:border-terracotta hover:text-terracotta"
          >
            {uploading ? "Uploading…" : "Add"}
            <input
              id={inputId}
              ref={inputRef}
              type="file"
              accept={ACCEPTED_TYPES}
              multiple
              disabled={uploading}
              onChange={(event) => void handleFiles(event.target.files)}
              className="sr-only"
            />
          </label>
        )}
      </div>

      {disabled && (
        <p className="mt-gutter-xs text-body-sm text-nutmeg">
          Image upload isn&apos;t connected yet — this product can still be saved without
          photos.
        </p>
      )}
      {error && <p className="mt-gutter-xs text-body-sm text-error">{error}</p>}
    </div>
  );
}
