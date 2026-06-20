"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/fragrances"
import type { CartItem } from "@/lib/cart"

type CartLineItemProps = {
  item: CartItem
  onIncrement: () => void
  onDecrement: () => void
  onRemove: () => void
  compact?: boolean
}

export function CartLineItem({
  item,
  onIncrement,
  onDecrement,
  onRemove,
  compact = false,
}: CartLineItemProps) {
  const lineTotal = (item.price || 0) * item.quantity

  return (
    <div
      className={`grid rounded-[1.5rem] border border-border/70 bg-background/70 p-4 ${
        compact
          ? "grid-cols-[4.25rem_minmax(0,1fr)] gap-3 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-4"
          : "grid-cols-[5.5rem_minmax(0,1fr)] gap-4"
      }`}
    >
      <Link
        href={`/perfumes/${item.slug}`}
        className={`luxury-panel flex items-center justify-center overflow-hidden rounded-[1.2rem] bg-luxury-soft/70 ${
          compact ? "h-[4.25rem] w-[4.25rem] p-2.5 sm:h-[4.5rem] sm:w-[4.5rem] sm:p-3" : "h-[5.5rem] w-[5.5rem] p-3"
        }`}
      >
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            width={compact ? 72 : 88}
            height={compact ? 72 : 88}
            unoptimized
            className="h-full w-full object-contain"
          />
        ) : (
          <span className="text-center text-xs uppercase tracking-[0.16em] text-muted-foreground">
            No image
          </span>
        )}
      </Link>

      <div className={`flex min-w-0 flex-col ${compact ? "gap-2.5 sm:gap-3" : "gap-3"}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="luxury-meta text-[11px] uppercase tracking-[0.2em]">{item.brand}</p>
            <Link
              href={`/perfumes/${item.slug}`}
              className={`mt-1 line-clamp-2 font-medium tracking-tight text-luxury-ink transition-colors hover:text-primary dark:text-foreground ${
                compact ? "text-base sm:text-lg" : "text-lg"
              }`}
            >
              {item.name}
            </Link>
            <p className={`mt-1 text-muted-foreground ${compact ? "text-xs sm:text-sm" : "text-sm"}`}>
              {item.oilType || item.family} · {formatPrice(item.price)}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 rounded-full"
            onClick={onRemove}
            aria-label={`Remove ${item.name} from cart`}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>

        <div
          className={`flex gap-3 ${
            compact
              ? "flex-col items-start sm:flex-row sm:items-center sm:justify-between"
              : "flex-wrap items-center justify-between"
          }`}
        >
          <div className="inline-flex items-center rounded-full border border-border/70 bg-luxury-soft/70 p-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="rounded-full"
              onClick={onDecrement}
              aria-label={`Decrease quantity of ${item.name}`}
            >
              <Minus className="size-3.5" />
            </Button>
            <span className="min-w-10 text-center text-sm font-medium">{item.quantity}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="rounded-full"
              onClick={onIncrement}
              aria-label={`Increase quantity of ${item.name}`}
            >
              <Plus className="size-3.5" />
            </Button>
          </div>

          <div className={compact ? "text-left sm:text-right" : "text-right"}>
            <p className="luxury-copy text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Line total
            </p>
            <p className={`font-medium text-luxury-ink dark:text-foreground ${compact ? "text-base sm:text-lg" : "text-lg"}`}>
              {formatPrice(lineTotal)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
