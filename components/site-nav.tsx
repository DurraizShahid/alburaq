"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"

import { useCart } from "@/components/cart-provider"
import { Button } from "@/components/ui/button"

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/perfumes", label: "Shop" },
  { href: "/cart", label: "Cart page" },
  { href: "/checkout", label: "Checkout" },
] as const

export function SiteNav() {
  const { itemCount, openCart, hasHydrated } = useCart()

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4 md:px-10 lg:px-12">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-dark.png"
            alt="Alburaq Atelier logo"
            width={344}
            height={94}
            className="h-auto w-[140px] md:w-[165px]"
          />
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-2">
          {primaryLinks.map((link) => (
            <Button key={link.href} variant="ghost" size="sm" asChild>
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={openCart}
          >
            <ShoppingBag />
            Open cart
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] leading-none text-primary">
              {hasHydrated ? itemCount : 0}
            </span>
          </Button>
        </nav>
      </div>
    </header>
  )
}
