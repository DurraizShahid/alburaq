import Image from "next/image"
import Link from "next/link"

import { Droplets, Star, Wind } from "lucide-react"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/fragrances"
import {
  Card,
  CardContent,
} from "@/components/ui/card"

type FragranceCardProps = {
  fragrance: {
    slug: string
    name: string
    brand: string
    family: string
    year: number | null
    price: number | string | null
    imageUrl?: string | null
    transparentImageUrl?: string | null
    imageFallbacks?: string[]
    oilType?: string | null
    longevity?: string | null
    sillage?: string | null
    rating?: number | null
    confidence?: string | null
    popularity?: string | null
    generalNotes?: string[]
    accords?: string[]
    notes?:
      | string[]
      | {
          top: Array<{ name: string }>
          middle: Array<{ name: string }>
          base: Array<{ name: string }>
        }
  }
}

export function FragranceCard({ fragrance }: FragranceCardProps) {
  const structuredNotes =
    fragrance.notes && !Array.isArray(fragrance.notes) ? fragrance.notes : undefined
  const imageSrc =
    fragrance.transparentImageUrl ||
    fragrance.imageUrl ||
    fragrance.imageFallbacks?.[0] ||
    null
  const compositionCount =
    fragrance.accords?.length ||
    fragrance.generalNotes?.length ||
    (Array.isArray(fragrance.notes)
      ? fragrance.notes.length
      : (structuredNotes?.top.length || 0) +
        (structuredNotes?.middle.length || 0) +
        (structuredNotes?.base.length || 0))
  const notePreview =
    fragrance.generalNotes?.slice(0, 3).join(" · ") ||
    (Array.isArray(fragrance.notes) ? fragrance.notes.slice(0, 3).join(" · ") : "") ||
    fragrance.accords?.slice(0, 3).join(" · ") ||
    "No note breakdown yet"
  const brandLine = [fragrance.brand, fragrance.year].filter(Boolean).join(" · ")
  const cartProduct = {
    id: fragrance.slug,
    slug: fragrance.slug,
    name: fragrance.name,
    brand: fragrance.brand,
    family: fragrance.family,
    price: typeof fragrance.price === "number" ? fragrance.price : null,
    imageUrl: imageSrc,
    oilType: fragrance.oilType,
  }

  return (
    <Card className="luxury-shell group h-full overflow-hidden rounded-[2rem] border border-white/40 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-32px_rgba(15,23,42,0.45)] dark:border-white/10 dark:bg-card">
      <CardContent className="flex h-full flex-col p-4 sm:p-5">
        <Link href={`/perfumes/${fragrance.slug}`} className="block">
          <div className="luxury-panel rounded-[1.65rem] p-3.5 dark:bg-muted/30">
            <div className="luxury-canvas relative h-72 overflow-hidden rounded-[1.45rem] p-3 dark:bg-background/40">
              <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
                <span className="luxury-chip-solid rounded-[1rem] px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase">
                  {fragrance.family}
                </span>
                <span className="luxury-chip-soft rounded-[1rem] px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase">
                  {fragrance.oilType || "Fragrance"}
                </span>
              </div>

              {imageSrc ? (
                <div className="flex h-full items-center justify-center p-6 sm:p-8">
                  <Image
                    src={imageSrc}
                    alt={fragrance.name}
                    width={240}
                    height={240}
                    unoptimized
                    sizes="240px"
                    className="h-[13.5rem] w-[13.5rem] max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
              ) : (
                <div className="luxury-copy flex h-full items-center justify-center px-8 text-center text-sm">
                  Image pending
                </div>
              )}
            </div>

            <div className="mt-3 grid grid-cols-[1.45fr_0.7fr_0.8fr_0.8fr] gap-3">
              <div className="luxury-soft rounded-[1.2rem] px-4 py-3.5 dark:bg-background/50 dark:text-foreground">
                <div className="luxury-meta text-xs uppercase tracking-[0.26em]">
                  Accords
                </div>
                <div className="mt-2 text-[1.05rem] font-medium">
                  {compositionCount || "N/A"}
                </div>
              </div>

              <div className="luxury-soft rounded-[1.2rem] px-4 py-3.5 dark:bg-background/50 dark:text-foreground">
                <div className="flex items-center justify-center text-primary">
                  <Star className="size-4 fill-current" />
                </div>
                <div className="mt-2 text-center text-[1.05rem] font-medium">
                  {fragrance.rating ? fragrance.rating.toFixed(1) : "N/A"}
                </div>
              </div>

              <div className="luxury-soft flex flex-col items-center justify-center rounded-[1.2rem] px-3 py-3.5 dark:bg-background/50 dark:text-foreground">
                <Droplets className="size-5" />
                <span className="luxury-copy mt-2 text-xs font-medium uppercase tracking-[0.18em]">
                  {fragrance.longevity?.slice(0, 3) || "N/A"}
                </span>
              </div>

              <div className="luxury-soft flex flex-col items-center justify-center rounded-[1.2rem] px-3 py-3.5 dark:bg-background/50 dark:text-foreground">
                <Wind className="size-5" />
                <span className="luxury-copy mt-2 text-xs font-medium uppercase tracking-[0.18em]">
                  {fragrance.sillage?.slice(0, 3) || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </Link>

        <div className="flex flex-1 flex-col px-2 pb-1 pt-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
            <div className="min-w-0">
              <p className="luxury-meta min-h-[1rem] text-[11px] uppercase tracking-[0.24em]">
                {brandLine}
              </p>
              <Link href={`/perfumes/${fragrance.slug}`} className="mt-2 block">
                <h3 className="line-clamp-2 min-h-[3.8rem] text-[1.85rem] leading-[1.02] font-medium tracking-[-0.035em] text-luxury-ink transition-colors hover:text-primary dark:text-foreground">
                  {fragrance.name}
                </h3>
              </Link>
              <p className="luxury-copy mt-2.5 line-clamp-2 min-h-[2.75rem] text-sm leading-6">
                {notePreview}
              </p>
            </div>

            <div className="shrink-0 self-end rounded-[1.15rem] bg-muted/40 px-3 py-2 text-right dark:bg-background/40">
              <p className="luxury-copy text-[11px] uppercase tracking-[0.18em]">
                {fragrance.confidence || fragrance.popularity || "Live catalog"}
              </p>
              <p className="mt-1.5 text-[1.95rem] leading-none font-medium tracking-[-0.045em] text-luxury-ink dark:text-foreground">
                {typeof fragrance.price === "string"
                  ? fragrance.price
                  : formatPrice(fragrance.price ?? null)}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-11 w-full justify-center rounded-[1.1rem] border-border/70 bg-background/70"
              asChild
            >
              <Link href={`/perfumes/${fragrance.slug}`}>View details</Link>
            </Button>
            <AddToCartButton
              product={cartProduct}
              className="h-11 justify-center rounded-[1.1rem] shadow-sm"
              fullWidth
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
