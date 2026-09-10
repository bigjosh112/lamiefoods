import Link from "next/link";
import { ADMIN_ROUTES } from "@lamiefoods/config";
import type { Product } from "@lamiefoods/types";
import { ProductForm } from "@/components/admin/product-form";

/**
 * Edit a product. Same form as create (`ProductForm`), pre-filled — see
 * `lib/admin/product-schema.ts:fromProduct`.
 */
export function EditProductView({
  product,
  blobConfigured,
  justCreated = false,
}: {
  product: Product;
  blobConfigured: boolean;
  justCreated?: boolean;
}) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-gutter-sm">
        <ol className="flex flex-wrap items-center gap-gutter-xs text-body-sm text-nutmeg">
          <li>
            <Link
              href={ADMIN_ROUTES.products}
              className="inline-flex items-center gap-gutter-xs transition-colors hover:text-terracotta"
            >
              ← Products
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-cacao">
            {product.name}
          </li>
        </ol>
      </nav>

      <ProductForm
        product={product}
        blobConfigured={blobConfigured}
        justCreated={justCreated}
      />
    </>
  );
}
