export const CART_STORAGE_KEY = "alburaq-cart-v1"

export type CartProduct = {
  id: string
  slug: string
  name: string
  brand: string
  family: string
  price: number | null
  imageUrl: string | null
  oilType?: string | null
}

export type CartItem = CartProduct & {
  quantity: number
}

export type ShippingMethod = "standard" | "express"

export const SHIPPING_OPTIONS: Array<{
  id: ShippingMethod
  label: string
  description: string
}> = [
  {
    id: "standard",
    label: "Standard delivery",
    description: "2-4 business days. Free from GBP 150.",
  },
  {
    id: "express",
    label: "Express delivery",
    description: "Next business day dispatch where available.",
  },
]

export function hasValidPrice(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
}

export function sanitizeCartItem(item: Partial<CartItem> & Pick<CartItem, "id" | "slug" | "name">) {
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    brand: item.brand || "Alburaq Atelier",
    family: item.family || "fragrance",
    price: hasValidPrice(item.price) ? item.price : null,
    imageUrl: item.imageUrl || null,
    oilType: item.oilType || null,
    quantity: Math.max(1, Math.min(99, Math.round(item.quantity || 1))),
  } satisfies CartItem
}

export function sanitizeCartItems(items: unknown) {
  if (!Array.isArray(items)) return []

  return items.reduce<CartItem[]>((acc, item) => {
    if (!item || typeof item !== "object") return acc
    const row = item as Partial<CartItem> & Pick<CartItem, "id" | "slug" | "name">
    if (typeof row.id !== "string" || typeof row.slug !== "string" || typeof row.name !== "string") {
      return acc
    }
    acc.push(sanitizeCartItem(row))
    return acc
  }, [])
}

export function getCartItemCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

export function getCartSubtotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)
}

export function getShippingAmount(subtotal: number, method: ShippingMethod) {
  if (method === "express") return subtotal > 0 ? 9.95 : 0
  if (subtotal >= 150) return 0
  return subtotal > 0 ? 4.95 : 0
}

export function getCartTotal(items: CartItem[], method: ShippingMethod) {
  const subtotal = getCartSubtotal(items)
  return subtotal + getShippingAmount(subtotal, method)
}
