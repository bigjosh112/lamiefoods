"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { cn } from "@lamiefoods/ui";
import { ADMIN_ROUTES } from "@lamiefoods/config";
import { PRODUCT_CATEGORIES, type Product } from "@lamiefoods/types";
import { Button } from "@/components/ui/button";
import { ICONS } from "@/components/ui/icons";
import { ImageUpload } from "@/components/admin/image-upload";
import {
  CATEGORY_LABELS,
  CRUNCH_SCALE,
  EDIT_PRODUCT,
  NEW_PRODUCT,
} from "@/content/admin-new-product";
import {
  ALLERGENS,
  MAX_PRODUCT_IMAGES,
  TEASER_LIMIT,
  fromProduct,
  productSchema,
  slugify,
  type ProductFormValues,
} from "@/lib/admin/product-schema";
import { createProduct, updateProduct } from "@/lib/api/admin-products";
import { ApiError } from "@/lib/api";

function messageForSaveFailure(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Something went wrong — please try again.";
  }
  if (
    error.body &&
    typeof error.body === "object" &&
    "error" in error.body &&
    typeof error.body.error === "string"
  ) {
    return error.body.error;
  }
  if (error.status === 409) {
    return "That URL slug is already used by another product.";
  }
  return "Could not save the product — please try again.";
}

/**
 * Create or edit a product.
 *
 * Real end to end now: validation, packaging tiers, allergen register,
 * discount, image upload and the actual save all work. `product` being
 * present is what distinguishes edit from create — everything else about the
 * form is identical either way.
 *
 * Two things from the mock are deliberately absent, both because the claim
 * would be false: a "Paystack realtime settlement — CONNECTED" badge
 * (Paystack has nothing to do with the catalogue) and a promise to generate
 * a "SHA-256 verifiable batch stamp" on publish (nothing generates one).
 */
export function ProductForm({
  product,
  blobConfigured,
  justCreated = false,
}: {
  /** Present for edit, absent for create. */
  product?: Product;
  /** Whether image upload is actually connected — see `isBlobStorageConfigured()`. */
  blobConfigured: boolean;
  /** True when we just landed here from a successful create (`?created=1`). */
  justCreated?: boolean;
}) {
  const formId = useId();
  const isEditing = Boolean(product);
  const [notes, setNotes] = useState<string[]>([]);
  const [noteDraft, setNoteDraft] = useState("");
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: standardSchemaResolver(productSchema),
    mode: "onTouched",
    defaultValues: product
      ? fromProduct(product)
      : {
          title: "",
          slug: "",
          category: "chinchin",
          teaser: "",
          narrative: "",
          pairings: "",
          crunch: 8,
          ingredients: "",
          allergens: [],
          allergensConfirmed: false,
          shelfLife: "",
          storage: "",
          tiers: [{ name: "100g Pouch", price: "", sku: "", stock: "", restockThreshold: "" }],
          storefrontActive: true,
          featureOnHomepage: false,
          seasonalEdition: false,
          discountPercent: null,
          images: [],
        },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "tiers" });

  // `useWatch` rather than `watch()`: it subscribes to a value instead of
  // handing back a function the React Compiler has to bail out on.
  const teaser = useWatch({ control, name: "teaser" }) ?? "";
  const crunch = useWatch({ control, name: "crunch" });
  const discountPercent = useWatch({ control, name: "discountPercent" });
  const images = useWatch({ control, name: "images" }) ?? [];

  const addNote = () => {
    const value = noteDraft.trim();
    if (!value || notes.includes(value)) return;
    setNotes((current) => [...current, value]);
    setNoteDraft("");
  };

  const onValid = async (values: ProductFormValues) => {
    setSaving(true);
    setSaveError(null);

    try {
      const parsed = productSchema.parse(values);
      const saved = isEditing
        ? await updateProduct(product!.slug, parsed)
        : await createProduct(parsed);

      router.push(`${ADMIN_ROUTES.editProduct(saved.slug)}?created=1`);
      router.refresh();
    } catch (error) {
      setSaving(false);
      setSaveError(messageForSaveFailure(error));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onValid)}
      noValidate
      className="flex flex-col gap-gutter-sm"
    >
      <header className="flex flex-wrap items-start justify-between gap-gutter-md rounded border border-rule/70 bg-surface-container-low p-gutter-md">
        <div className="max-w-2xl">
          <p className="font-label text-label-caps text-terracotta uppercase">
            {isEditing ? EDIT_PRODUCT.eyebrow : NEW_PRODUCT.eyebrow}
          </p>
          <h1 className="mt-1 text-headline-lg text-cacao">
            {isEditing ? EDIT_PRODUCT.title : NEW_PRODUCT.title}
          </h1>
          <p className="mt-gutter-xs text-body-sm text-on-surface-variant">
            {isEditing ? EDIT_PRODUCT.body : NEW_PRODUCT.body}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-gutter-xs">
          <Button type="submit" disabled={saving}>
            <ICONS.seal className="h-4 w-4" />
            {saving ? "Saving…" : isEditing ? "Save changes" : "Save & publish"}
          </Button>
        </div>
      </header>

      <div aria-live="polite">
        {saveError && (
          <p className="rounded border border-error/40 bg-error/10 p-gutter-sm text-body-sm text-error">
            {saveError}
          </p>
        )}
        {!saveError && justCreated && (
          <p className="rounded border border-rule/70 bg-secondary-container/30 p-gutter-sm text-body-sm text-cacao">
            {EDIT_PRODUCT.createdSuccess}
          </p>
        )}
      </div>

      <div className="grid gap-gutter-sm xl:grid-cols-3">
        <div className="flex flex-col gap-gutter-sm xl:col-span-2">
          <Section index={1} step="Section 01" title="Product identity">
            <Field
              id={`${formId}-title`}
              label="Product title"
              required
              error={errors.title?.message}
              placeholder="e.g. Roasted Nutmeg & Wild Honey Chinchin"
              {...register("title", {
                onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
                  if (!slugTouched) setValue("slug", slugify(event.target.value));
                },
              })}
            />

            <div>
              <Label htmlFor={`${formId}-slug`} required>
                URL slug
              </Label>
              <input
                id={`${formId}-slug`}
                placeholder="roasted-nutmeg-wild-honey-chinchin"
                className={inputClasses(Boolean(errors.slug))}
                {...register("slug", {
                  onChange: () => setSlugTouched(true),
                })}
              />
              <p className="mt-1 text-body-sm text-nutmeg">
                Shown in the product&apos;s URL — changing this on a live product changes
                its address.
              </p>
              <FieldError>{errors.slug?.message}</FieldError>
            </div>

            <div>
              <Label htmlFor={`${formId}-category`} required>
                Category
              </Label>
              <select
                id={`${formId}-category`}
                className={inputClasses(Boolean(errors.category))}
                {...register("category")}
              >
                {PRODUCT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {CATEGORY_LABELS[category]}
                  </option>
                ))}
              </select>
              <FieldError>{errors.category?.message}</FieldError>
            </div>

            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-gutter-sm">
                <Label htmlFor={`${formId}-teaser`}>Card description</Label>
                <span
                  className={cn(
                    "font-label text-label-sm",
                    teaser.length > TEASER_LIMIT ? "text-error" : "text-nutmeg",
                  )}
                >
                  {teaser.length} / {TEASER_LIMIT}
                </span>
              </div>
              <textarea
                id={`${formId}-teaser`}
                rows={3}
                placeholder="Shown on product cards across the shop."
                className={inputClasses(Boolean(errors.teaser))}
                {...register("teaser")}
              />
              <FieldError>{errors.teaser?.message}</FieldError>
            </div>

            <div>
              <Label htmlFor={`${formId}-narrative`}>Origin story</Label>
              {/* Formatting needs a rich-text editor, which is not worth a
                dependency yet — the toolbar is shown disabled rather than
                pretending to work. */}
              <div className="mt-1 flex gap-gutter-xs rounded-t border border-b-0 border-rule/70 bg-surface-container-low px-2 py-1">
                {["B", "I", "“", "•"].map((mark) => (
                  <span
                    key={mark}
                    aria-disabled="true"
                    title="Rich text editing is not wired up yet"
                    className="inline-flex h-8 w-8 cursor-not-allowed items-center justify-center font-label text-label-sm text-nutmeg/60"
                  >
                    {mark}
                  </span>
                ))}
              </div>
              <textarea
                id={`${formId}-narrative`}
                rows={5}
                placeholder="The longer story shown on the product page."
                className={cn(inputClasses(false), "mt-0 rounded-t-none")}
                {...register("narrative")}
              />
            </div>
          </Section>

          <Section index={2} step="Section 02" title="Sensory profile">
            <div>
              <Label htmlFor={`${formId}-note`}>Tasting notes</Label>
              <div className="mt-1 flex flex-wrap gap-gutter-xs">
                {notes.map((note) => (
                  <span
                    key={note}
                    className="inline-flex items-center gap-gutter-xs rounded-sm bg-secondary-container px-2 py-1 font-label text-label-sm text-on-secondary-fixed"
                  >
                    {note}
                    <button
                      type="button"
                      onClick={() => setNotes((c) => c.filter((n) => n !== note))}
                      className="hover:text-error"
                    >
                      <span className="sr-only">Remove {note}</span>
                      <span aria-hidden="true">×</span>
                    </button>
                  </span>
                ))}
              </div>
              <input
                id={`${formId}-note`}
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return;
                  // Enter adds a note; it must not submit the whole form.
                  event.preventDefault();
                  addNote();
                }}
                placeholder="Add a note and press Enter"
                className={inputClasses(false)}
              />
            </div>

            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-gutter-sm">
                <Label htmlFor={`${formId}-crunch`}>Crunch index</Label>
                <span className="font-label text-label-md text-terracotta">
                  {crunch} / 10
                </span>
              </div>
              <input
                id={`${formId}-crunch`}
                type="range"
                min={1}
                max={10}
                step={0.5}
                className="mt-2 w-full accent-terracotta"
                {...register("crunch", { valueAsNumber: true })}
              />
              <div className="mt-1 flex justify-between text-body-sm text-nutmeg">
                {CRUNCH_SCALE.map((point) => (
                  <span key={point.value}>
                    {point.label} ({point.value})
                  </span>
                ))}
              </div>
            </div>

            <Field
              id={`${formId}-pairings`}
              label="Drink pairings"
              placeholder="e.g. chilled hibiscus, black coffee"
              {...register("pairings")}
            />
          </Section>

          <Section index={3} step="Section 03" title="Formulation & shelf care">
            <div>
              <Label htmlFor={`${formId}-ingredients`} required>
                Ingredients, heaviest first
              </Label>
              <textarea
                id={`${formId}-ingredients`}
                rows={4}
                placeholder="Unbleached wheat flour, churned sweet cream butter, …"
                className={inputClasses(Boolean(errors.ingredients))}
                {...register("ingredients")}
              />
              <FieldError>{errors.ingredients?.message}</FieldError>
            </div>

            {/* The allergen register. This is the field GAP-007 is about: the
              storefront must never state allergens nobody confirmed. */}
            <fieldset>
              <legend className="font-label text-label-caps text-nutmeg uppercase">
                Allergen register <span className="text-terracotta">*</span>
              </legend>
              <p className="mt-1 text-body-sm text-nutmeg">
                A legal declaration shown to customers. Tick everything that applies, or
                confirm none do.
              </p>
              <div className="mt-gutter-xs grid gap-gutter-xs sm:grid-cols-3">
                {ALLERGENS.map((allergen) => (
                  <label
                    key={allergen}
                    className="flex items-center gap-gutter-xs rounded border border-rule/70 bg-surface-container-low p-gutter-sm text-body-sm text-cacao"
                  >
                    <input
                      type="checkbox"
                      value={allergen}
                      className="h-4 w-4 rounded-sm border border-rule accent-terracotta"
                      {...register("allergens")}
                    />
                    {allergen}
                  </label>
                ))}
              </div>
              <label className="mt-gutter-xs flex items-center gap-gutter-xs text-body-sm text-on-surface-variant">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded-sm border border-rule accent-terracotta"
                  {...register("allergensConfirmed")}
                />
                This product contains none of the above
              </label>
              <FieldError>{errors.allergens?.message}</FieldError>
            </fieldset>

            <div className="grid gap-gutter-sm sm:grid-cols-2">
              <Field
                id={`${formId}-shelf`}
                label="Shelf life"
                required
                error={errors.shelfLife?.message}
                placeholder="e.g. 12 weeks unopened"
                {...register("shelfLife")}
              />
              <Field
                id={`${formId}-storage`}
                label="Storage instruction"
                required
                error={errors.storage?.message}
                placeholder="e.g. cool, dry cupboard"
                {...register("storage")}
              />
            </div>
          </Section>
        </div>

        <div className="flex flex-col gap-gutter-sm">
          <Panel
            title="Photography"
            note={`${images.length} of ${MAX_PRODUCT_IMAGES} photos`}
          >
            <ImageUpload
              images={images}
              onChange={(next) => setValue("images", next, { shouldDirty: true })}
              disabled={!blobConfigured}
            />
          </Panel>

          <Panel
            title="Packaging tiers"
            action={
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  append({
                    name: "",
                    price: "",
                    sku: "",
                    stock: "",
                    restockThreshold: "",
                  })
                }
              >
                Add tier
              </Button>
            }
          >
            <ul className="space-y-3">
              {fields.map((field, index) => (
                <li
                  key={field.id}
                  className="rounded border border-rule/70 bg-surface-container-low p-gutter-sm"
                >
                  <div className="flex items-start justify-between gap-gutter-sm">
                    <input
                      aria-label={`Tier ${index + 1} name`}
                      placeholder="e.g. 100g Pouch"
                      className={cn(inputClasses(false), "mt-0 flex-1")}
                      {...register(`tiers.${index}.name`)}
                    />
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="mt-1 shrink-0 text-nutmeg hover:text-error"
                      >
                        <span className="sr-only">Remove tier {index + 1}</span>
                        <span aria-hidden="true">×</span>
                      </button>
                    )}
                  </div>
                  <div className="mt-gutter-xs grid gap-gutter-xs sm:grid-cols-2">
                    <div>
                      <Label htmlFor={`${formId}-price-${index}`}>Price (₦)</Label>
                      <input
                        id={`${formId}-price-${index}`}
                        inputMode="numeric"
                        placeholder="2000"
                        className={inputClasses(Boolean(errors.tiers?.[index]?.price))}
                        {...register(`tiers.${index}.price`)}
                      />
                      <FieldError>{errors.tiers?.[index]?.price?.message}</FieldError>
                    </div>
                    <div>
                      <Label htmlFor={`${formId}-sku-${index}`}>SKU</Label>
                      <input
                        id={`${formId}-sku-${index}`}
                        placeholder="LF-MVC-100"
                        className={inputClasses(Boolean(errors.tiers?.[index]?.sku))}
                        {...register(`tiers.${index}.sku`)}
                      />
                      <FieldError>{errors.tiers?.[index]?.sku?.message}</FieldError>
                    </div>
                    <div>
                      <Label htmlFor={`${formId}-stock-${index}`}>Stock on hand</Label>
                      <input
                        id={`${formId}-stock-${index}`}
                        inputMode="numeric"
                        placeholder="100"
                        className={inputClasses(Boolean(errors.tiers?.[index]?.stock))}
                        {...register(`tiers.${index}.stock`)}
                      />
                      <FieldError>{errors.tiers?.[index]?.stock?.message}</FieldError>
                    </div>
                    <div>
                      <Label htmlFor={`${formId}-threshold-${index}`}>
                        Restock alert at
                      </Label>
                      <input
                        id={`${formId}-threshold-${index}`}
                        inputMode="numeric"
                        placeholder="20"
                        className={inputClasses(
                          Boolean(errors.tiers?.[index]?.restockThreshold),
                        )}
                        {...register(`tiers.${index}.restockThreshold`)}
                      />
                      <FieldError>
                        {errors.tiers?.[index]?.restockThreshold?.message}
                      </FieldError>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-gutter-sm rounded border border-rule/70 bg-surface p-gutter-sm text-body-sm text-nutmeg">
              Each size has its own stock. Stock decrements for that size when an order
              line is confirmed paid — by Paystack or by a manually-confirmed bank
              transfer.
            </p>
          </Panel>

          <Panel title="Promotion">
            <div>
              <Label htmlFor={`${formId}-discount`}>Discount</Label>
              <div className="relative">
                <input
                  id={`${formId}-discount`}
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 20"
                  className={cn(inputClasses(Boolean(errors.discountPercent)), "pr-10")}
                  {...register("discountPercent", {
                    setValueAs: (value) =>
                      value === "" || value === null || value === undefined
                        ? null
                        : Number(value),
                  })}
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-label text-label-md text-nutmeg">
                  %
                </span>
              </div>
              <p className="mt-1 text-body-sm text-nutmeg">
                {discountPercent
                  ? `Customers see ${discountPercent}% off every packaging tier.`
                  : "Leave blank for no promotion."}
              </p>
              <FieldError>{errors.discountPercent?.message}</FieldError>
            </div>
          </Panel>

          <Panel title="Visibility">
            <div className="space-y-3">
              <Toggle
                label="Show on the storefront"
                note="Customers can find and buy it."
                {...register("storefrontActive")}
              />
              <Toggle
                label="Feature on the homepage"
                note="Appears in the flavours row."
                {...register("featureOnHomepage")}
              />
              <Toggle
                label="Seasonal edition"
                note="Marks packaging as a limited release."
                {...register("seasonalEdition")}
              />
            </div>
          </Panel>
        </div>
      </div>
    </form>
  );
}

const inputClasses = (invalid: boolean) =>
  cn(
    "mt-1 min-h-11 w-full rounded border bg-[#f8f3ec] px-3 py-2 text-body-md text-cacao placeholder:text-nutmeg/70 focus:outline-none",
    invalid ? "border-error focus:border-error" : "border-rule focus:border-terracotta",
  );

/** Matches the numbered fieldsets on the customer checkout, deliberately. */
function Section({
  index,
  step,
  title,
  children,
}: {
  index: number;
  step: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="rounded border border-rule/70 bg-surface p-inset-card">
      <legend className="sr-only">{title}</legend>
      <div className="mb-gutter-md flex items-center justify-between gap-gutter-sm">
        <div className="flex items-center gap-gutter-xs">
          <span
            aria-hidden="true"
            className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-container font-label text-label-sm text-linen"
          >
            {index}
          </span>
          <h2 className="text-headline-sm text-cacao">{title}</h2>
        </div>
        <span className="shrink-0 font-label text-label-sm text-nutmeg uppercase">
          {step}
        </span>
      </div>
      <div className="grid gap-gutter-sm">{children}</div>
    </fieldset>
  );
}

function Panel({
  title,
  note,
  action,
  children,
}: {
  title: string;
  note?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded border border-rule/70 bg-surface p-gutter-md">
      <div className="mb-gutter-sm flex flex-wrap items-center justify-between gap-gutter-sm">
        <h2 className="text-headline-sm text-cacao">{title}</h2>
        {note && (
          <span className="font-label text-label-sm text-nutmeg uppercase">{note}</span>
        )}
        {action}
      </div>
      {children}
    </section>
  );
}

function Label({
  htmlFor,
  required,
  children,
}: {
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block font-label text-label-caps text-nutmeg uppercase"
    >
      {children}
      {required && <span className="text-terracotta"> *</span>}
    </label>
  );
}

function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="mt-1 text-body-sm text-error">{children}</p>;
}

function Field({
  id,
  label,
  required,
  error,
  ref,
  ...input
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
} & React.ComponentPropsWithRef<"input">) {
  return (
    <div>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <input
        {...input}
        id={id}
        ref={ref}
        aria-invalid={Boolean(error)}
        className={inputClasses(Boolean(error))}
      />
      <FieldError>{error}</FieldError>
    </div>
  );
}

/** Switch-styled checkbox, so the visibility panel matches the design. */
function Toggle({
  label,
  note,
  ref,
  ...input
}: {
  label: string;
  note: string;
} & React.ComponentPropsWithRef<"input">) {
  return (
    <label className="flex items-start gap-gutter-sm rounded border border-rule/70 bg-surface-container-low p-gutter-sm">
      <span className="min-w-0 flex-1">
        <span className="block text-body-sm font-semibold text-cacao">{label}</span>
        <span className="block text-body-sm text-nutmeg">{note}</span>
      </span>
      <input
        {...input}
        ref={ref}
        type="checkbox"
        className="mt-1 h-5 w-5 shrink-0 accent-terracotta"
      />
    </label>
  );
}
