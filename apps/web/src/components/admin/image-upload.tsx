"use client";

import { useId, useRef, useState, type MouseEvent } from "react";
import { upload } from "@vercel/blob/client";
import { cn } from "@lamiefoods/ui";
import { ImageSlot } from "@/components/ui/image-slot";
import { MAX_PRODUCT_IMAGES } from "@/lib/admin/product-schema";

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
const MAX_IMAGES = MAX_PRODUCT_IMAGES;

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function UploadProgressOverlay({
  percent,
  batchLabel,
  compact = false,
}: {
  percent: number;
  batchLabel: string | null;
  compact?: boolean;
}) {
  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-gutter-xs bg-cacao px-gutter-sm"
      role="progressbar"
      aria-label="Uploading photos"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
    >
      <p
        className={cn(
          "font-numeral text-linen tabular-nums",
          compact ? "text-headline-sm" : "text-headline-md",
        )}
      >
        {percent}%
      </p>
      {batchLabel ? (
        <p className="font-label text-label-sm text-linen uppercase">{batchLabel}</p>
      ) : null}
      <div className="h-1 w-full overflow-hidden rounded-full bg-linen/30">
        <div
          className="h-full rounded-full bg-terracotta transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function RemovePhotoButton({
  onClick,
  label,
}: {
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-cacao/85 text-linen backdrop-blur-sm hover:bg-error"
    >
      <span className="sr-only">{label}</span>
      <span aria-hidden="true">×</span>
    </button>
  );
}

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
 * Array order IS display order: index 0 is always the hero (`role: "hero"`),
 * and `sort_order` on save follows that array index. Clicking a thumbnail
 * promotes it to the hero so shop cards and the PDP main image stay in sync.
 *
 * A batch of files is one overall 0–100% bar (byte-weighted), so the percent
 * never resets between files.
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
  const [percent, setPercent] = useState(0);
  const [batchLabel, setBatchLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const hero = images[0] ?? null;
  const gallery = images.slice(1);
  const remaining = MAX_IMAGES - images.length;
  const showHeroProgress = uploading && !hero;
  const showAddProgress = uploading && Boolean(hero);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    if (remaining <= 0) {
      setError(`A product can have at most ${MAX_IMAGES} images.`);
      return;
    }
    const files = Array.from(fileList).slice(0, remaining);
    if (files.length === 0) return;

    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    let finishedBytes = 0;

    setUploading(true);
    setPercent(0);
    setBatchLabel(files.length > 1 ? `1 of ${files.length}` : null);
    setError(null);

    try {
      const uploaded: ImageValue[] = [];
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        if (!file) continue;
        if (files.length > 1) {
          setBatchLabel(`${index + 1} of ${files.length}`);
        }
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/admin/uploads",
          onUploadProgress: ({ loaded }) => {
            const overall =
              totalBytes === 0
                ? 100
                : ((finishedBytes + loaded) / totalBytes) * 100;
            setPercent(clampPercent(overall));
          },
        });
        finishedBytes += file.size;
        setPercent(
          clampPercent(totalBytes === 0 ? 100 : (finishedBytes / totalBytes) * 100),
        );
        uploaded.push({
          url: blob.url,
          alt: "",
          role: images.length === 0 && uploaded.length === 0 ? "hero" : "gallery",
        });
      }
      const next = [...images, ...uploaded].map((image, index) => ({
        ...image,
        role: index === 0 ? ("hero" as const) : ("gallery" as const),
      }));
      onChange(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed — please try again.");
    } finally {
      setUploading(false);
      setPercent(0);
      setBatchLabel(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeAt = (targetUrl: string) => {
    const next = images
      .filter((image) => image.url !== targetUrl)
      .map((image, index) => ({
        ...image,
        role: index === 0 ? ("hero" as const) : ("gallery" as const),
      }));
    onChange(next);
  };

  /** Move the chosen image to index 0 and mark it hero so sort_order matches. */
  const makeHero = (targetUrl: string) => {
    const target = images.find((image) => image.url === targetUrl);
    if (!target) return;
    const rest = images.filter((image) => image.url !== targetUrl);
    onChange([
      { ...target, role: "hero" },
      ...rest.map((image) => ({ ...image, role: "gallery" as const })),
    ]);
  };

  const setAlt = (targetUrl: string, alt: string) => {
    onChange(
      images.map((image) => (image.url === targetUrl ? { ...image, alt } : image)),
    );
  };

  const showAddTile = remaining > 0 && !disabled && !showHeroProgress;

  return (
    <div aria-busy={uploading}>
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded border border-rule/70 bg-surface-container">
        {hero ? (
          <>
            <ImageSlot
              slot={{ src: hero.url, alt: hero.alt || "Hero image", note: "" }}
              sizes="(min-width: 1024px) 24rem, 100vw"
            />
            <RemovePhotoButton
              onClick={() => removeAt(hero.url)}
              label="Remove hero image"
            />
          </>
        ) : showHeroProgress ? null : (
          <p className="font-label text-label-sm text-nutmeg/70 uppercase">Hero image</p>
        )}
        {showHeroProgress ? (
          <UploadProgressOverlay percent={percent} batchLabel={batchLabel} />
        ) : null}
      </div>

      {hero && (
        <label className="mt-gutter-xs block">
          <span className="font-label text-label-sm text-nutmeg uppercase">
            Hero alt text
          </span>
          <input
            type="text"
            value={hero.alt}
            onChange={(event) => setAlt(hero.url, event.target.value)}
            placeholder="Describe the photo for customers using a screen reader"
            className="mt-1 min-h-11 w-full rounded border border-rule bg-surface-container-low px-3 text-body-sm text-cacao placeholder:text-nutmeg/70 focus:border-terracotta focus:outline-none"
          />
        </label>
      )}

      {(gallery.length > 0 || showAddTile) && (
        <div className="mt-gutter-xs grid grid-cols-2 gap-gutter-xs sm:grid-cols-3 md:grid-cols-5">
          {gallery.map((image, galleryIndex) => (
            <div key={image.url} className="min-w-0">
              <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded border border-rule/70 bg-surface-container">
                <button
                  type="button"
                  onClick={() => makeHero(image.url)}
                  className="absolute inset-0 cursor-pointer"
                >
                  <ImageSlot
                    slot={{
                      src: image.url,
                      alt: image.alt || "Product photo",
                      note: "",
                    }}
                    sizes="(min-width: 768px) 6rem, 30vw"
                  />
                  <span className="sr-only">Use as hero image</span>
                </button>
                <RemovePhotoButton
                  onClick={(event) => {
                    event.stopPropagation();
                    removeAt(image.url);
                  }}
                  label={`Remove photo ${galleryIndex + 2}`}
                />
              </div>
              <label className="mt-1 block">
                <span className="sr-only">Alt text for photo {galleryIndex + 2}</span>
                <input
                  type="text"
                  value={image.alt}
                  onChange={(event) => setAlt(image.url, event.target.value)}
                  placeholder="Alt text"
                  className="min-h-9 w-full rounded border border-rule bg-surface-container-low px-2 text-body-sm text-cacao placeholder:text-nutmeg/70 focus:border-terracotta focus:outline-none"
                />
              </label>
            </div>
          ))}

          {showAddTile && (
            <label
              htmlFor={inputId}
              className="relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded border border-dashed border-rule/70 font-label text-label-sm text-nutmeg/70 transition-colors hover:border-terracotta hover:text-terracotta"
            >
              {showAddProgress ? (
                <UploadProgressOverlay
                  percent={percent}
                  batchLabel={batchLabel}
                  compact
                />
              ) : (
                "Add"
              )}
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
      )}

      {remaining === 0 && !disabled && (
        <p className="mt-gutter-xs text-body-sm text-nutmeg">
          Maximum of {MAX_IMAGES} photos reached. Remove one to add another.
        </p>
      )}

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
