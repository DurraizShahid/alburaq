"use client"

import Link from "next/link"

import { CartLineItem } from "@/components/cart-line-item"
import { useCart } from "@/components/cart-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatPrice } from "@/lib/fragrances"

export function CartPage() {
  const { items, itemCount, subtotal, updateQuantity, removeItem, clearCart } = useCart()

  if (!items.length) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-8 md:px-10 lg:px-12">
        <Card className="luxury-shell rounded-[2rem] dark:bg-card">
          <CardContent className="flex flex-col items-center px-6 py-16 text-center">
            <Badge variant="secondary" className="text-muted-foreground">
              Cart
            </Badge>
            <h1 className="mt-4 font-heading text-4xl tracking-tight text-luxury-ink dark:text-foreground">
              Your cart is waiting.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
              Add perfumes from the archive, then return here to review quantities and move into
              checkout.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button className="rounded-[1.1rem]" asChild>
                <Link href="/perfumes">Browse perfumes</Link>
              </Button>
              <Button variant="outline" className="rounded-[1.1rem]" asChild>
                <Link href="/">Back home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-8 md:px-10 lg:px-12">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="space-y-3">
            <Badge variant="secondary" className="text-muted-foreground">
              Cart
            </Badge>
            <h1 className="font-heading text-4xl tracking-tight md:text-5xl">Review your order.</h1>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              Adjust quantities, remove anything you do not need, and continue to the secure
              checkout form when ready.
            </p>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <CartLineItem
                key={item.id}
                item={item}
                onIncrement={() => updateQuantity(item.id, item.quantity + 1)}
                onDecrement={() => updateQuantity(item.id, item.quantity - 1)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </div>
        </div>

        <Card className="luxury-shell h-fit rounded-[2rem] dark:bg-card">
          <CardHeader className="space-y-3">
            <Badge variant="secondary" className="w-fit text-muted-foreground">
              Order summary
            </Badge>
            <CardTitle className="text-2xl tracking-tight text-luxury-ink dark:text-foreground">
              Everything stays on-site.
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">Items</span>
              <span>{itemCount}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>Chosen at checkout</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-3 text-lg font-medium text-luxury-ink dark:text-foreground">
              <span>Estimated total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <p className="text-sm leading-7 text-muted-foreground">
              Standard and express delivery are available at checkout. Free standard shipping
              applies automatically for baskets over GBP 150.
            </p>
            <div className="grid gap-3">
              <Button className="rounded-[1.1rem]" asChild>
                <Link href="/checkout">Proceed to checkout</Link>
              </Button>
              <Button variant="outline" className="rounded-[1.1rem]" asChild>
                <Link href="/perfumes">Continue shopping</Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="rounded-[1.1rem]"
                onClick={clearCart}
              >
                Clear cart
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
