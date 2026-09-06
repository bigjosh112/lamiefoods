/** Single source of truth for internal paths, so links cannot drift. */
export const ROUTES = {
  home: "/",
  shop: "/shop",
  product: (slug: string) => `/shop/${slug}`,
  cart: "/cart",
  checkout: "/checkout",
  orderSuccess: "/order-success",
  about: "/about",
} as const;

export const ADMIN_ROUTES = {
  login: "/admin/login",
  dashboard: "/admin",
  orders: "/admin/orders",
  order: (id: string) => `/admin/orders/${id}`,
  products: "/admin/products",
  newProduct: "/admin/products/new",
  editProduct: (id: string) => `/admin/products/${id}/edit`,
  customers: "/admin/customers",
  inventory: "/admin/inventory",
  settings: "/admin/settings",
} as const;
