import Link from "next/link";
import { ADMIN_ROUTES } from "@lamiefoods/config";
import { ProductForm } from "@/components/admin/product-form";
import { NEW_PRODUCT } from "@/content/admin-new-product";

/**
 * Create a product.
 *
 * Real end to end now: validation, packaging tiers, image upload and saving
 * all work, and `Save & publish` actually creates a row. Chrome comes from
 * `AdminShell` in the portal layout, so the sidebar and top bar cannot drift
 * from the other admin screens.
 */
export function NewProductView({ blobConfigured }: { blobConfigured: boolean }) {
  return (
    <>
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

      <ProductForm blobConfigured={blobConfigured} />
    </>
  );
}
