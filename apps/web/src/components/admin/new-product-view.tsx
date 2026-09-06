import Link from "next/link";
import { ADMIN_ROUTES } from "@lamiefoods/config";
import { ProductForm } from "@/components/admin/product-form";
import { ICONS } from "@/components/ui/icons";
import { NEW_PRODUCT } from "@/content/admin-new-product";

/**
 * Create a product.
 *
 * The banner and breadcrumb are server-rendered; the form itself is a client
 * component because it is genuinely interactive. Chrome comes from `AdminShell`
 * in the portal layout, so the sidebar and top bar cannot drift from the other
 * admin screens.
 *
 * The form validates for real but cannot save — there is no catalogue service.
 * That is stated once, at the top, rather than being discovered after someone
 * has typed a whole product in.
 */
export function NewProductView() {
  return (
    <>
      <div
        role="note"
        className="mb-gutter-md flex items-start gap-gutter-sm rounded border border-error/40 bg-error-container p-gutter-sm text-on-error-container"
      >
        <ICONS.shield className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-body-sm">
          <strong className="font-semibold">This form cannot save anything.</strong>{" "}
          Validation, packaging tiers and every control below are real and work, but there
          is no catalogue service to publish to — nothing you enter here is stored, and
          nothing reaches the storefront.
        </p>
      </div>

      <nav aria-label="Breadcrumb" className="mb-gutter-sm">
        <ol className="flex flex-wrap items-center gap-gutter-xs text-body-sm text-nutmeg">
          <li>
            <Link
              href={ADMIN_ROUTES.products}
              className="inline-flex items-center gap-gutter-xs transition-colors hover:text-terracotta"
            >
              ← {NEW_PRODUCT.breadcrumb[0]}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-cacao">
            {NEW_PRODUCT.breadcrumb[1]}
          </li>
        </ol>
      </nav>

      <ProductForm />
    </>
  );
}
