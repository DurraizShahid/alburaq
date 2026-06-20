"use client"

import Link from "next/link"
import * as React from "react"

import { useCart } from "@/components/cart-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  SHIPPING_OPTIONS,
  type ShippingMethod,
  getCartTotal,
  getShippingAmount,
} from "@/lib/cart"
import { formatPrice } from "@/lib/fragrances"

type CheckoutFormState = {
  firstName: string
  lastName: string
  email: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  postcode: string
  country: string
  notes: string
}

const INITIAL_FORM_STATE: CheckoutFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  postcode: "",
  country: "United Kingdom",
  notes: "",
}

type OrderSuccess = {
  orderNumber: string
  total: number
}

export function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const [shippingMethod, setShippingMethod] = React.useState<ShippingMethod>("standard")
  const [form, setForm] = React.useState(INITIAL_FORM_STATE)
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [success, setSuccess] = React.useState<OrderSuccess | null>(null)

  const shippingAmount = getShippingAmount(subtotal, shippingMethod)
  const total = getCartTotal(items, shippingMethod)

  const updateField = (field: keyof CheckoutFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!items.length) {
      setError("Your cart is empty.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: form,
          shippingMethod,
          items,
        }),
      })

      const payload = (await response.json()) as
        | { error?: string; orderNumber?: string; total?: number }
        | undefined

      if (!response.ok || !payload?.orderNumber || typeof payload.total !== "number") {
        throw new Error(payload?.error || "Checkout could not be completed.")
      }

      setSuccess({
        orderNumber: payload.orderNumber,
        total: payload.total,
      })
      clearCart()
      setForm(INITIAL_FORM_STATE)
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Checkout could not be completed."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-8 md:px-10 lg:px-12">
        <Card className="luxury-shell rounded-[2rem] dark:bg-card">
          <CardContent className="flex flex-col items-center px-6 py-16 text-center">
            <Badge variant="secondary" className="text-muted-foreground">
              Order placed
            </Badge>
            <h1 className="mt-4 font-heading text-4xl tracking-tight text-luxury-ink dark:text-foreground">
              Thank you for your order.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
              Order <span className="font-medium text-foreground">{success.orderNumber}</span> has
              been captured with a total of {formatPrice(success.total)}. A confirmation email can
              now be sent or processed from your internal order workflow.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button className="rounded-[1.1rem]" asChild>
                <Link href="/perfumes">Shop again</Link>
              </Button>
              <Button variant="outline" className="rounded-[1.1rem]" asChild>
                <Link href="/">Return home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (!items.length) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-8 md:px-10 lg:px-12">
        <Card className="luxury-shell rounded-[2rem] dark:bg-card">
          <CardContent className="flex flex-col items-center px-6 py-16 text-center">
            <Badge variant="secondary" className="text-muted-foreground">
              Checkout
            </Badge>
            <h1 className="mt-4 font-heading text-4xl tracking-tight text-luxury-ink dark:text-foreground">
              Add something before checkout.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
              Your checkout form appears once there are items in the cart.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button className="rounded-[1.1rem]" asChild>
                <Link href="/perfumes">Browse perfumes</Link>
              </Button>
              <Button variant="outline" className="rounded-[1.1rem]" asChild>
                <Link href="/cart">View cart</Link>
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
        <Card className="luxury-shell rounded-[2rem] dark:bg-card">
          <CardHeader className="space-y-3">
            <Badge variant="secondary" className="w-fit text-muted-foreground">
              Checkout
            </Badge>
            <CardTitle className="text-3xl tracking-tight text-luxury-ink dark:text-foreground">
              Complete your order on-site.
            </CardTitle>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              Capture delivery information, choose shipping, and submit the order without sending
              the customer to an external shop.
            </p>
          </CardHeader>

          <CardContent>
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium">First name</span>
                  <Input
                    required
                    value={form.firstName}
                    onChange={(event) => updateField("firstName", event.target.value)}
                    placeholder="Aaliyah"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium">Last name</span>
                  <Input
                    required
                    value={form.lastName}
                    onChange={(event) => updateField("lastName", event.target.value)}
                    placeholder="Rahman"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium">Email</span>
                  <Input
                    required
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    placeholder="you@example.com"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium">Phone</span>
                  <Input
                    value={form.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                    placeholder="+44 7000 000000"
                  />
                </label>
              </div>

              <div className="grid gap-5">
                <label className="space-y-2">
                  <span className="text-sm font-medium">Address line 1</span>
                  <Input
                    required
                    value={form.addressLine1}
                    onChange={(event) => updateField("addressLine1", event.target.value)}
                    placeholder="Unit 12, 20 River Road"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium">Address line 2</span>
                  <Input
                    value={form.addressLine2}
                    onChange={(event) => updateField("addressLine2", event.target.value)}
                    placeholder="Apartment, suite, or company"
                  />
                </label>
                <div className="grid gap-5 md:grid-cols-3">
                  <label className="space-y-2">
                    <span className="text-sm font-medium">City</span>
                    <Input
                      required
                      value={form.city}
                      onChange={(event) => updateField("city", event.target.value)}
                      placeholder="Barking"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium">Postcode</span>
                    <Input
                      required
                      value={form.postcode}
                      onChange={(event) => updateField("postcode", event.target.value)}
                      placeholder="IG11 0DG"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium">Country</span>
                    <Input
                      required
                      value={form.country}
                      onChange={(event) => updateField("country", event.target.value)}
                      placeholder="United Kingdom"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-medium text-luxury-ink dark:text-foreground">
                    Shipping method
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    The selected rate is stored with the order submission.
                  </p>
                </div>

                <div className="grid gap-3">
                  {SHIPPING_OPTIONS.map((option) => {
                    const amount = getShippingAmount(subtotal, option.id)
                    return (
                      <label
                        key={option.id}
                        className="flex cursor-pointer items-start justify-between gap-4 rounded-[1.4rem] border border-border/70 bg-background/70 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="shippingMethod"
                            checked={shippingMethod === option.id}
                            onChange={() => setShippingMethod(option.id)}
                            className="mt-1"
                          />
                          <div>
                            <p className="font-medium text-luxury-ink dark:text-foreground">
                              {option.label}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {option.description}
                            </p>
                          </div>
                        </div>
                        <span className="shrink-0 text-sm font-medium">
                          {amount === 0 ? "Free" : formatPrice(amount)}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <label className="space-y-2">
                <span className="text-sm font-medium">Delivery notes</span>
                <Textarea
                  value={form.notes}
                  onChange={(event) => updateField("notes", event.target.value)}
                  placeholder="Gate code, preferred dispatch notes, or gifting instructions"
                  rows={4}
                />
              </label>

              {error ? (
                <div className="rounded-[1.2rem] border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <Button type="submit" className="rounded-[1.1rem]" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Place order"}
                </Button>
                <Button variant="outline" className="rounded-[1.1rem]" asChild>
                  <Link href="/cart">Back to cart</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="luxury-shell h-fit rounded-[2rem] dark:bg-card">
          <CardHeader className="space-y-3">
            <Badge variant="secondary" className="w-fit text-muted-foreground">
              Summary
            </Badge>
            <CardTitle className="text-2xl tracking-tight text-luxury-ink dark:text-foreground">
              Order totals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-luxury-ink dark:text-foreground">
                    {item.name}
                  </p>
                  <p className="text-muted-foreground">
                    {item.brand} · Qty {item.quantity}
                  </p>
                </div>
                <span className="shrink-0">{formatPrice((item.price || 0) * item.quantity)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shippingAmount === 0 ? "Free" : formatPrice(shippingAmount)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-3 text-lg font-medium text-luxury-ink dark:text-foreground">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
