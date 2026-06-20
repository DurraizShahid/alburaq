import { NextRequest, NextResponse } from "next/server"

import { type CartItem, sanitizeCartItems, getCartSubtotal, getCartTotal } from "@/lib/cart"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

type CheckoutCustomer = {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  postcode?: string
  country?: string
  notes?: string
}

type CheckoutPayload = {
  customer?: CheckoutCustomer
  shippingMethod?: "standard" | "express"
  items?: unknown
}

function toOrderNumber() {
  const timestamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14)
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `ABQ-${timestamp}-${suffix}`
}

function getRequiredText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function validateItems(items: CartItem[]) {
  return items.filter((item) => typeof item.price === "number" && item.price >= 0 && item.quantity > 0)
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as CheckoutPayload
    const customer = payload.customer || {}
    const shippingMethod = payload.shippingMethod === "express" ? "express" : "standard"
    const items = validateItems(sanitizeCartItems(payload.items))

    if (!items.length) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 })
    }

    const firstName = getRequiredText(customer.firstName)
    const lastName = getRequiredText(customer.lastName)
    const email = getRequiredText(customer.email)
    const addressLine1 = getRequiredText(customer.addressLine1)
    const city = getRequiredText(customer.city)
    const postcode = getRequiredText(customer.postcode)
    const country = getRequiredText(customer.country) || "United Kingdom"

    if (!firstName || !lastName || !email || !addressLine1 || !city || !postcode) {
      return NextResponse.json({ error: "Missing required checkout fields." }, { status: 400 })
    }

    const subtotal = getCartSubtotal(items)
    const total = getCartTotal(items, shippingMethod)
    const shippingAmount = total - subtotal
    const orderNumber = toOrderNumber()
    const supabase = getSupabaseAdmin()

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_first_name: firstName,
        customer_last_name: lastName,
        customer_email: email,
        customer_phone: getRequiredText(customer.phone) || null,
        shipping_address_line_1: addressLine1,
        shipping_address_line_2: getRequiredText(customer.addressLine2) || null,
        shipping_city: city,
        shipping_postcode: postcode,
        shipping_country: country,
        shipping_method: shippingMethod,
        shipping_amount: shippingAmount,
        subtotal_amount: subtotal,
        total_amount: total,
        item_count: items.reduce((sum, item) => sum + item.quantity, 0),
        status: "pending",
        notes: getRequiredText(customer.notes) || null,
      })
      .select("id,order_number,total_amount")
      .single()

    if (orderError || !order) {
      throw orderError || new Error("Order could not be created.")
    }

    const { error: itemError } = await supabase.from("order_items").insert(
      items.map((item) => ({
        order_id: order.id,
        fragrance_id: item.id,
        fragrance_slug: item.slug,
        fragrance_name: item.name,
        fragrance_brand: item.brand,
        unit_price: item.price || 0,
        quantity: item.quantity,
        line_total: (item.price || 0) * item.quantity,
      }))
    )

    if (itemError) {
      throw itemError
    }

    return NextResponse.json({
      orderNumber: order.order_number,
      total: Number(order.total_amount),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
