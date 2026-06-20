"use client"

import Link from "next/link"
import * as React from "react"

import { CartLineItem } from "@/components/cart-line-item"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  CART_STORAGE_KEY,
  type CartItem,
  type CartProduct,
  type ShippingMethod,
  getCartItemCount,
  getCartSubtotal,
  getShippingAmount,
  sanitizeCartItems,
  sanitizeCartItem,
} from "@/lib/cart"
import { formatPrice } from "@/lib/fragrances"

type CartContextValue = {
  items: CartItem[]
  itemCount: number
  subtotal: number
  hasHydrated: boolean
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (product: CartProduct, quantity?: number) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
}

const CartContext = React.createContext<CartContextValue | null>(null)

function getInitialCartItems() {
  if (typeof window === "undefined") return []

  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY)
    return stored ? sanitizeCartItems(JSON.parse(stored)) : []
  } catch {
    window.localStorage.removeItem(CART_STORAGE_KEY)
    return []
  }
}

function subscribeToHydration() {
  return () => {}
}

export function useCart() {
  const context = React.useContext(CartContext)

  if (!context) {
    throw new Error("useCart must be used within a CartProvider.")
  }

  return context
}

function CartSheetBody({
  items,
  subtotal,
  itemCount,
  closeCart,
  removeItem,
  updateQuantity,
}: {
  items: CartItem[]
  subtotal: number
  itemCount: number
  closeCart: () => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
}) {
  const estimatedShipping = getShippingAmount(subtotal, "standard" satisfies ShippingMethod)
  const estimatedTotal = subtotal + estimatedShipping
  const hasItems = items.length > 0

  return (
    <>
      <SheetHeader className="border-b border-border/60 px-4 pt-5 pb-4 pr-14 sm:px-6 sm:pt-6 sm:pb-5 sm:pr-16">
        <div className="flex items-center justify-between gap-3">
          <SheetTitle>Cart</SheetTitle>
          <span className="luxury-meta rounded-full bg-luxury-soft px-3 py-1 text-[10px] uppercase tracking-[0.24em] sm:text-[11px]">
            {itemCount} item{itemCount === 1 ? "" : "s"}
          </span>
        </div>
        <SheetDescription>
          Review your fragrances, adjust quantities, and continue to checkout without leaving the
          site.
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
        {hasItems ? (
          <div className="space-y-3 sm:space-y-4">
            {items.map((item) => (
              <CartLineItem
                key={item.id}
                item={item}
                compact
                onIncrement={() => updateQuantity(item.id, item.quantity + 1)}
                onDecrement={() => updateQuantity(item.id, item.quantity - 1)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="luxury-shell flex h-full min-h-0 flex-col items-center justify-center rounded-[1.75rem] px-5 py-10 text-center sm:rounded-[2rem] sm:px-8 sm:py-12 dark:bg-card">
            <p className="luxury-meta text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              Your cart is empty
            </p>
            <h3 className="mt-3 text-balance font-heading text-2xl tracking-tight text-luxury-ink sm:text-3xl dark:text-foreground">
              Start building a fragrance ritual.
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-7 text-muted-foreground">
              Add perfumes from the catalog and return here anytime. Your cart stays saved on
              this device.
            </p>
            <Button className="mt-6 min-w-44 rounded-[1.1rem]" asChild>
              <Link href="/perfumes" onClick={closeCart}>
                Browse perfumes
              </Link>
            </Button>
          </div>
        )}
      </div>

      <SheetFooter className="border-t border-border/60 bg-background/95 px-4 pt-4 pb-4 supports-[padding:max(0px)]:pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:pt-5 sm:pb-6">
        <div className="space-y-4 rounded-[1.5rem] border border-border/70 bg-luxury-soft/60 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>{itemCount} item{itemCount === 1 ? "" : "s"}</span>
            <span>{formatPrice(subtotal)} subtotal</span>
          </div>
          <Separator />
          <div className="grid gap-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Estimated shipping</span>
              <span>{subtotal ? formatPrice(estimatedShipping) : "Calculated at checkout"}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-base font-medium text-luxury-ink dark:text-foreground">
              <span>Estimated total</span>
              <span>{formatPrice(estimatedTotal)}</span>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="outline" className="rounded-[1.1rem]" asChild>
              <Link href="/cart" onClick={closeCart}>
                View cart
              </Link>
            </Button>
            <Button className="rounded-[1.1rem]" asChild>
              <Link href="/checkout" onClick={closeCart}>
                Checkout
              </Link>
            </Button>
          </div>
        </div>
      </SheetFooter>
    </>
  )
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>(() => getInitialCartItems())
  const [isOpen, setIsOpen] = React.useState(false)
  const hasHydrated = React.useSyncExternalStore(subscribeToHydration, () => true, () => false)
  const isMobile = useIsMobile()

  React.useEffect(() => {
    if (!hasHydrated) return
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [hasHydrated, items])

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== CART_STORAGE_KEY) return

      try {
        setItems(sanitizeCartItems(event.newValue ? JSON.parse(event.newValue) : []))
      } catch {
        setItems([])
      }
    }

    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const addItem = React.useCallback((product: CartProduct, quantity = 1) => {
    const normalized = sanitizeCartItem({ ...product, quantity })

    setItems((current) => {
      const existing = current.find((item) => item.id === normalized.id)
      if (!existing) return [...current, normalized]

      return current.map((item) =>
        item.id === normalized.id
          ? {
              ...item,
              quantity: Math.max(1, Math.min(99, item.quantity + normalized.quantity)),
            }
          : item
      )
    })

  }, [])

  const updateQuantity = React.useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((current) => current.filter((item) => item.id !== productId))
      return
    }

    setItems((current) =>
      current.map((item) =>
        item.id === productId ? { ...item, quantity: Math.max(1, Math.min(99, quantity)) } : item
      )
    )
  }, [])

  const removeItem = React.useCallback((productId: string) => {
    setItems((current) => current.filter((item) => item.id !== productId))
  }, [])

  const clearCart = React.useCallback(() => {
    setItems([])
  }, [])

  const itemCount = React.useMemo(() => getCartItemCount(items), [items])
  const subtotal = React.useMemo(() => getCartSubtotal(items), [items])

  const contextValue = React.useMemo<CartContextValue>(
    () => ({
      items,
      itemCount,
      subtotal,
      hasHydrated,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [addItem, clearCart, hasHydrated, isOpen, itemCount, items, removeItem, subtotal, updateQuantity]
  )

  return (
    <CartContext.Provider value={contextValue}>
      {children}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className="flex h-[min(92vh,46rem)] w-full max-w-none flex-col overflow-hidden rounded-t-[1.75rem] border-t border-border/70 bg-background p-0 md:h-full md:max-w-[34rem] md:rounded-none md:border-t-0 md:border-l"
        >
          <CartSheetBody
            items={items}
            subtotal={subtotal}
            itemCount={itemCount}
            closeCart={() => setIsOpen(false)}
            removeItem={removeItem}
            updateQuantity={updateQuantity}
          />
        </SheetContent>
      </Sheet>
    </CartContext.Provider>
  )
}
