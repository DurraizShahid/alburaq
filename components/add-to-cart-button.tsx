"use client"

import * as React from "react"
import { ShoppingBag } from "lucide-react"
import { useRouter } from "next/navigation"

import { useCart } from "@/components/cart-provider"
import { Button } from "@/components/ui/button"
import type { CartProduct } from "@/lib/cart"
import { hasValidPrice } from "@/lib/cart"

type AddToCartButtonProps = {
  product: CartProduct
  quantity?: number
  variant?: React.ComponentProps<typeof Button>["variant"]
  size?: React.ComponentProps<typeof Button>["size"]
  className?: string
  openCartOnAdd?: boolean
  checkoutOnAdd?: boolean
  fullWidth?: boolean
}

export function AddToCartButton({
  product,
  quantity = 1,
  variant = "default",
  size = "default",
  className,
  openCartOnAdd = true,
  checkoutOnAdd = false,
  fullWidth = false,
}: AddToCartButtonProps) {
  const router = useRouter()
  const { addItem, openCart } = useCart()
  const [justAdded, setJustAdded] = React.useState(false)

  const canPurchase = hasValidPrice(product.price)

  React.useEffect(() => {
    if (!justAdded) return
    const timeout = window.setTimeout(() => setJustAdded(false), 1400)
    return () => window.clearTimeout(timeout)
  }, [justAdded])

  const handleClick = () => {
    if (!canPurchase) return
    addItem(product, quantity)
    setJustAdded(true)

    if (checkoutOnAdd) {
      router.push("/checkout")
      return
    }

    if (openCartOnAdd) {
      openCart()
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={`${fullWidth ? "w-full" : ""} ${className || ""}`.trim()}
      disabled={!canPurchase}
      onClick={handleClick}
    >
      <ShoppingBag />
      {canPurchase ? (justAdded ? "Added" : checkoutOnAdd ? "Buy now" : "Add to cart") : "Unavailable"}
    </Button>
  )
}
