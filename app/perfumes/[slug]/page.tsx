import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import {
  Clock3,
  Droplets,
  FlaskConical,
  Sparkles,
  Wind,
} from "lucide-react"

import { AddToCartButton } from "@/components/add-to-cart-button"
import { FragranceCard } from "@/components/fragrance-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  type Fragrance,
  formatPrice,
  getFragranceBySlug,
  getRelatedFragrances,
} from "@/lib/fragrances"

const NOTE_PYRAMID_LAYOUT: Array<{
  key: keyof Fragrance["notes"]
  title: string
  stage: string
  description: string
  widthClass: string
  shellClass: string
  chipClass: string
}> = [
  {
    key: "top",
    title: "Top notes",
    stage: "0-30 min",
    description: "First lift, sparkle, and the immediate signature on skin.",
    widthClass: "w-full md:mx-auto md:w-[74%]",
    shellClass:
      "border-primary/28 bg-[linear-gradient(135deg,rgba(252,246,236,0.98),rgba(238,221,190,0.95))]",
    chipClass: "bg-white/75 text-luxury-ink",
  },
  {
    key: "middle",
    title: "Heart notes",
    stage: "30 min-4 hrs",
    description: "Core body of the fragrance once the opening starts to settle.",
    widthClass: "w-full md:mx-auto md:w-[87%]",
    shellClass:
      "border-border bg-[linear-gradient(135deg,rgba(247,240,230,0.98),rgba(233,221,205,0.94))]",
    chipClass: "bg-luxury-soft/90 text-luxury-ink",
  },
  {
    key: "base",
    title: "Base notes",
    stage: "4 hrs+",
    description: "Dry down, texture, and the materials that anchor the full wear.",
    widthClass: "w-full",
    shellClass:
      "border-primary/34 bg-[linear-gradient(135deg,rgba(240,226,206,0.98),rgba(205,172,123,0.92))]",
    chipClass: "bg-luxury-soft/80 text-luxury-ink",
  },
]

function toTitleLabel(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function toRankingPercent(score: number) {
  if (!Number.isFinite(score)) return 0
  if (score <= 1) return Math.round(score * 100)
  if (score <= 10) return Math.round(score * 10)
  return Math.round(clamp(score, 0, 100))
}

function toAccordPercent(value: string | undefined, fallback: number) {
  if (!value) return fallback

  const normalized = value.toLowerCase()
  const numericMatch = normalized.match(/(\d+(?:\.\d+)?)/)

  if (numericMatch) {
    const amount = Number(numericMatch[1])
    return clamp(amount <= 1 ? Math.round(amount * 100) : Math.round(amount), 18, 100)
  }

  if (normalized.includes("high") || normalized.includes("strong")) return 82
  if (normalized.includes("medium") || normalized.includes("moderate")) return 62
  if (normalized.includes("soft") || normalized.includes("light")) return 38

  return fallback
}

function getPerformanceProfile(value: string | null, kind: "longevity" | "sillage") {
  const fallbackLabel = kind === "longevity" ? "Moderate wear" : "Moderate projection"
  const normalized = (value || "").toLowerCase()

  if (kind === "longevity") {
    const rangeMatch = normalized.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*hours?/)
    const singleMatch = normalized.match(/(\d+(?:\.\d+)?)\s*\+?\s*hours?/)

    if (rangeMatch || singleMatch) {
      const amount = rangeMatch
        ? (Number(rangeMatch[1]) + Number(rangeMatch[2])) / 2
        : Number(singleMatch?.[1] || 0)
      const fill = clamp(Math.round((amount / 12) * 100), 18, 100)

      return {
        fill,
        label: value || fallbackLabel,
        summary:
          amount >= 10
            ? "All-day endurance with a lingering dry down."
            : amount >= 7
              ? "Strong mid-to-late wear that stays readable for hours."
              : amount >= 4
                ? "Balanced wear that settles into a steady skin scent."
                : "Shorter wear focused on the opening and heart.",
      }
    }

    if (normalized.includes("very long") || normalized.includes("eternal")) {
      return {
        fill: 96,
        label: value || fallbackLabel,
        summary: "High-retention composition built for extended wear.",
      }
    }

    if (normalized.includes("long")) {
      return {
        fill: 82,
        label: value || fallbackLabel,
        summary: "Lasts well into the day with a persistent base.",
      }
    }

    if (normalized.includes("moderate")) {
      return {
        fill: 58,
        label: value || fallbackLabel,
        summary: "Moderate wear with a clear mid-phase before softening.",
      }
    }

    if (normalized.includes("short") || normalized.includes("light")) {
      return {
        fill: 34,
        label: value || fallbackLabel,
        summary: "Closer and quicker-wearing, ideal for subtle use.",
      }
    }

    return {
      fill: 56,
      label: value || fallbackLabel,
      summary: "Performance reads as balanced without hard wear-time data.",
    }
  }

  if (
    normalized.includes("room-filling") ||
    normalized.includes("beast") ||
    normalized.includes("massive")
  ) {
    return {
      fill: 96,
      label: value || fallbackLabel,
      summary: "Projects broadly and leaves a strong scented trail.",
    }
  }

  if (normalized.includes("strong")) {
    return {
      fill: 80,
      label: value || fallbackLabel,
      summary: "Noticeable diffusion with strong personal aura and lift.",
    }
  }

  if (normalized.includes("intimate") && normalized.includes("room")) {
    return {
      fill: 74,
      label: value || fallbackLabel,
      summary: "Builds from close wear into a wider ambient cloud.",
    }
  }

  if (normalized.includes("moderate")) {
    return {
      fill: 58,
      label: value || fallbackLabel,
      summary: "Balanced projection that stays present without crowding the room.",
    }
  }

  if (
    normalized.includes("soft") ||
    normalized.includes("close") ||
    normalized.includes("intimate")
  ) {
    return {
      fill: 34,
      label: value || fallbackLabel,
      summary: "Wears closer to skin with discreet projection.",
    }
  }

  return {
    fill: 54,
    label: value || fallbackLabel,
    summary: "Projection reads as measured without explicit diffusion data.",
  }
}

export async function generateMetadata(
  props: PageProps<"/perfumes/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params
  const fragrance = await getFragranceBySlug(slug)

  if (!fragrance) {
    return {
      title: "Fragrance Not Found | Alburaq Atelier",
    }
  }

  return {
    title: `${fragrance.name} | ${fragrance.brand} | Alburaq Atelier`,
    description: `${fragrance.name} by ${fragrance.brand}. ${fragrance.oilType || "Fragrance"} with ${fragrance.accords.slice(0, 3).join(", ")} accords.`,
  }
}

export default async function FragranceDetailPage(props: PageProps<"/perfumes/[slug]">) {
  const { slug } = await props.params
  const fragrance = await getFragranceBySlug(slug)

  if (!fragrance) notFound()

  const related = await getRelatedFragrances(fragrance, 4)
  const imageSrc =
    fragrance.transparentImageUrl ||
    fragrance.imageUrl ||
    fragrance.imageFallbacks[0] ||
    null
  const cartProduct = {
    id: fragrance.id,
    slug: fragrance.slug,
    name: fragrance.name,
    brand: fragrance.brand,
    family: fragrance.family,
    price: fragrance.price,
    imageUrl: imageSrc,
    oilType: fragrance.oilType,
  }
  const noteLayers = NOTE_PYRAMID_LAYOUT.map((layer) => ({
    ...layer,
    items: fragrance.notes[layer.key],
  }))
  const totalNotes = noteLayers.reduce((sum, layer) => sum + layer.items.length, 0)
  const dominantLayer =
    [...noteLayers].sort((left, right) => right.items.length - left.items.length)[0] || noteLayers[1]
  const accordBars = fragrance.accords.slice(0, 6).map((accord, index) => ({
    accord,
    strength: toAccordPercent(fragrance.accordStrengths[accord], Math.max(42, 80 - index * 8)),
    label: fragrance.accordStrengths[accord] || `${Math.max(42, 80 - index * 8)}% presence`,
  }))
  const longevityProfile = getPerformanceProfile(fragrance.longevity, "longevity")
  const sillageProfile = getPerformanceProfile(fragrance.sillage, "sillage")
  const seasonRanking = [...fragrance.seasonRanking].sort((left, right) => right.score - left.score)
  const occasionRanking = [...fragrance.occasionRanking].sort(
    (left, right) => right.score - left.score
  )
  const leadSeason = seasonRanking[0]
  const leadOccasion = occasionRanking[0]

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-6 md:px-10 lg:px-12">
      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="luxury-shell overflow-hidden rounded-[2rem] dark:bg-card lg:col-span-2">
          <CardContent className="grid gap-6 p-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="luxury-panel rounded-[1.65rem] p-3 dark:bg-muted/30">
              <div className="luxury-canvas relative h-[30rem] overflow-hidden rounded-[1.45rem] p-3 dark:bg-background/40">
                <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
                  <span className="luxury-chip-solid rounded-[1rem] px-4 py-2 text-sm font-medium">
                    {fragrance.family}
                  </span>
                  <span className="luxury-chip-soft rounded-[1rem] px-4 py-2 text-sm font-medium">
                    {fragrance.oilType || "Fragrance"}
                  </span>
                </div>

                {imageSrc ? (
                  <Image
                    src={imageSrc}
                    alt={fragrance.name}
                    fill
                    unoptimized
                    sizes="(max-width: 1024px) 100vw, 40rem"
                    className="object-contain p-12"
                  />
                ) : (
                  <div className="luxury-copy flex h-full items-center justify-center px-8 text-center text-sm">
                    Image pending
                  </div>
                )}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="luxury-soft rounded-[1.2rem] px-4 py-3 dark:bg-background/50">
                  <p className="luxury-meta text-xs uppercase tracking-[0.26em]">Type</p>
                  <p className="mt-2 font-medium dark:text-foreground">
                    {fragrance.oilType || "Fragrance"}
                  </p>
                </div>
                <div className="luxury-soft rounded-[1.2rem] px-4 py-3 dark:bg-background/50">
                  <p className="luxury-meta text-xs uppercase tracking-[0.26em]">Rate</p>
                  <p className="mt-2 font-medium dark:text-foreground">
                    {fragrance.rating ? fragrance.rating.toFixed(2) : "N/A"}
                  </p>
                </div>
                <div className="luxury-soft rounded-[1.2rem] px-4 py-3 dark:bg-background/50">
                  <p className="luxury-meta text-xs uppercase tracking-[0.26em]">Long</p>
                  <p className="mt-2 font-medium dark:text-foreground">
                    {fragrance.longevity || "Moderate"}
                  </p>
                </div>
                <div className="luxury-soft rounded-[1.2rem] px-4 py-3 dark:bg-background/50">
                  <p className="luxury-meta text-xs uppercase tracking-[0.26em]">Trail</p>
                  <p className="mt-2 font-medium dark:text-foreground">
                    {fragrance.sillage || "Moderate"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between px-2 py-2">
              <div>
                <p className="luxury-meta text-[11px] uppercase tracking-[0.2em]">
                  {fragrance.brand}
                  {fragrance.country ? ` · ${fragrance.country}` : ""}
                  {fragrance.year ? ` · ${fragrance.year}` : ""}
                </p>
                <h1 className="mt-3 font-heading text-5xl tracking-tight text-luxury-ink dark:text-foreground md:text-6xl">
                  {fragrance.name}
                </h1>
                <p className="luxury-copy mt-4 max-w-2xl text-base leading-8">
                  {fragrance.generalNotes.slice(0, 6).join(" · ") || "Live catalog fragrance detail."}
                </p>
              </div>

              <div className="mt-8 space-y-6">
                <div className="flex items-end justify-between gap-6 border-t border-border/60 pt-6">
                  <div>
                    <p className="luxury-copy text-sm">Current price</p>
                    <p className="mt-1 text-[3rem] leading-none font-medium tracking-[-0.05em] text-luxury-ink dark:text-foreground">
                      {formatPrice(fragrance.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="luxury-copy text-sm">Confidence</p>
                    <p className="mt-1 text-lg font-medium text-luxury-ink dark:text-foreground">
                      {fragrance.confidence || fragrance.priceValue || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {fragrance.accords.map((accord) => (
                    <span
                      key={accord}
                      className="luxury-chip-soft rounded-[1rem] px-4 py-2 text-sm dark:bg-muted/30 dark:text-foreground"
                    >
                      {accord}
                      {fragrance.accordStrengths[accord]
                        ? ` · ${fragrance.accordStrengths[accord]}`
                        : ""}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button className="rounded-[1.1rem]" asChild>
                    <Link href="/perfumes">Keep browsing</Link>
                  </Button>
                  <AddToCartButton
                    product={cartProduct}
                    variant="outline"
                    className="rounded-[1.1rem]"
                  />
                  <AddToCartButton
                    product={cartProduct}
                    checkoutOnAdd
                    openCartOnAdd={false}
                    className="rounded-[1.1rem]"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 py-6 md:gap-6 md:py-8 xl:grid-cols-[1.18fr_0.82fr]">
        <Card className="luxury-shell overflow-hidden rounded-[1.75rem] dark:bg-card sm:rounded-[2rem]">
          <CardHeader className="border-b border-border/70 px-4 pb-5 sm:px-6 sm:pb-6 dark:border-border/60">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="text-muted-foreground">
                Scent architecture
              </Badge>
              <Badge className="border border-border/70 bg-luxury-soft text-luxury-ink hover:bg-luxury-soft dark:border-border/60 dark:bg-background/40 dark:text-foreground">
                {totalNotes} listed notes
              </Badge>
            </div>
            <div className="space-y-3">
              <CardTitle className="text-2xl tracking-tight text-luxury-ink sm:text-3xl dark:text-foreground">
                Proper note pyramid with staged evaporation cues.
              </CardTitle>
              <p className="luxury-copy max-w-3xl text-sm leading-7 dark:text-muted-foreground">
                Each tier maps how the composition opens, settles, and dries down so the
                fragrance reads like a visual formula instead of a plain note list.
              </p>
            </div>
          </CardHeader>

          <CardContent className="grid gap-5 px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-6 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="space-y-4">
              {noteLayers.map((layer) => (
                <div
                  key={layer.key}
                  className={`${layer.widthClass} relative overflow-hidden rounded-[1.55rem] border px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] sm:rounded-[1.8rem] sm:px-5 sm:py-5 ${layer.shellClass}`}
                >
                  <div className="pointer-events-none absolute inset-0 opacity-50">
                    <div className="absolute inset-x-0 top-0 h-px bg-white/70" />
                    <div className="absolute inset-y-0 left-[12%] w-px bg-white/20" />
                    <div className="absolute inset-y-0 right-[12%] w-px bg-black/5" />
                  </div>

                  <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <p className="luxury-meta text-[11px] uppercase tracking-[0.24em]">
                        {layer.stage}
                      </p>
                      <h3 className="text-xl font-medium tracking-tight text-luxury-ink sm:text-2xl">
                        {layer.title}
                      </h3>
                      <p className="luxury-copy max-w-xl text-sm leading-6">
                        {layer.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:min-w-[9rem] sm:grid-cols-1">
                      <div className="rounded-[1rem] border border-black/10 bg-white/55 px-3 py-2 text-luxury-ink backdrop-blur-sm sm:rounded-full sm:px-4 sm:text-right">
                        <p className="luxury-meta text-[10px] uppercase tracking-[0.28em]">
                          Count
                        </p>
                        <p className="mt-1 text-xl font-medium leading-none sm:text-2xl">
                          {layer.items.length}
                        </p>
                      </div>
                      <div className="rounded-[1rem] border border-black/8 bg-black/5 px-3 py-2 text-luxury-ink/90 sm:hidden">
                        <p className="luxury-meta text-[10px] uppercase tracking-[0.28em]">
                          Phase
                        </p>
                        <p className="mt-1 text-sm font-medium leading-none">
                          {layer.title.replace(" notes", "")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="relative mt-4 grid gap-2 sm:grid-cols-2">
                    {layer.items.length ? (
                      layer.items.map((note, index) => (
                        <div
                          key={`${layer.key}-${note.name}`}
                          className={`flex items-center justify-between gap-3 rounded-[1rem] border border-black/6 px-3 py-2.5 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] ${layer.chipClass}`}
                        >
                          <span className="font-medium text-luxury-ink">{note.name}</span>
                          <span className="luxury-meta shrink-0 text-[10px] uppercase tracking-[0.24em]">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="luxury-copy rounded-[1rem] bg-white/60 px-3 py-3 text-sm sm:col-span-2">
                        No notes listed for this stage.
                      </span>
                    )}
                  </div>

                  <div className="relative mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-[0.95rem] bg-white/45 px-2 py-2">
                      <p className="luxury-meta text-[10px] uppercase tracking-[0.22em]">Lift</p>
                      <p className="mt-1 text-sm font-medium text-luxury-ink">
                        {layer.key === "top" ? "Bright" : layer.key === "middle" ? "Rounded" : "Deep"}
                      </p>
                    </div>
                    <div className="rounded-[0.95rem] bg-white/45 px-2 py-2">
                      <p className="luxury-meta text-[10px] uppercase tracking-[0.22em]">Texture</p>
                      <p className="mt-1 text-sm font-medium text-luxury-ink">
                        {layer.key === "top" ? "Airy" : layer.key === "middle" ? "Velvet" : "Resinous"}
                      </p>
                    </div>
                    <div className="rounded-[0.95rem] bg-white/45 px-2 py-2">
                      <p className="luxury-meta text-[10px] uppercase tracking-[0.22em]">Focus</p>
                      <p className="mt-1 text-sm font-medium text-luxury-ink">
                        {layer.items.length ? layer.items[0]?.name : "Pending"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid content-start gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[1.45rem] border border-border/70 bg-luxury-soft p-4 sm:rounded-[1.7rem] sm:p-5 dark:border-border/60 dark:bg-background/40">
                <div className="flex items-center gap-3">
                  <div className="luxury-panel rounded-full p-2 text-luxury-ink dark:bg-muted/40 dark:text-foreground">
                    <FlaskConical className="size-4" />
                  </div>
                  <div>
                    <p className="luxury-meta text-xs uppercase tracking-[0.24em]">
                      Pyramid read
                    </p>
                    <p className="text-lg font-medium text-luxury-ink dark:text-foreground">
                      Composition snapshot
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="luxury-panel rounded-[1.25rem] px-4 py-4 dark:bg-muted/30">
                    <p className="luxury-meta text-[11px] uppercase tracking-[0.22em]">
                      Dominant stage
                    </p>
                    <p className="mt-2 text-lg font-medium text-luxury-ink dark:text-foreground">
                      {dominantLayer.title}
                    </p>
                  </div>
                  <div className="luxury-panel rounded-[1.25rem] px-4 py-4 dark:bg-muted/30">
                    <p className="luxury-meta text-[11px] uppercase tracking-[0.22em]">
                      Accord count
                    </p>
                    <p className="mt-2 text-lg font-medium text-luxury-ink dark:text-foreground">
                      {fragrance.accords.length || 0}
                    </p>
                  </div>
                  <div className="luxury-panel rounded-[1.25rem] px-4 py-4 dark:bg-muted/30">
                    <p className="luxury-meta text-[11px] uppercase tracking-[0.22em]">
                      Dry down
                    </p>
                    <p className="mt-2 text-lg font-medium text-luxury-ink dark:text-foreground">
                      {noteLayers[2].items.length ? "Textured" : "Undisclosed"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.45rem] border border-border/70 bg-luxury-soft p-4 sm:rounded-[1.7rem] sm:p-5 dark:border-border/60 dark:bg-background/40">
                <div className="flex items-center gap-3">
                  <div className="luxury-panel rounded-full p-2 text-luxury-ink dark:bg-muted/40 dark:text-foreground">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <p className="luxury-meta text-xs uppercase tracking-[0.24em]">
                      Accord diffusion
                    </p>
                    <p className="text-lg font-medium text-luxury-ink dark:text-foreground">
                      Main character intensity
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {accordBars.length ? (
                    accordBars.map((item) => (
                      <div key={item.accord} className="space-y-2">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                          <span className="text-sm font-medium text-luxury-ink dark:text-foreground">
                            {toTitleLabel(item.accord)}
                          </span>
                          <span className="luxury-meta text-[10px] uppercase tracking-[0.18em] sm:text-xs">
                            {item.label}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-luxury-hover dark:bg-muted/40">
                          <div
                            className="h-full rounded-full bg-[linear-gradient(90deg,#8a6429,#d7b06b)]"
                            style={{ width: `${item.strength}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="luxury-copy text-sm dark:text-muted-foreground">
                      Accord strength data has not been imported for this fragrance yet.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-[1.45rem] border border-border/70 bg-luxury-soft p-4 sm:rounded-[1.7rem] sm:p-5 sm:col-span-2 lg:col-span-1 dark:border-border/60 dark:bg-background/40">
                <p className="luxury-meta text-xs uppercase tracking-[0.24em]">
                  Development timeline
                </p>
                <div className="mt-4 space-y-3">
                  {noteLayers.map((layer, index) => (
                    <div
                      key={`timeline-${layer.key}`}
                      className="grid grid-cols-[auto_1fr] items-start gap-3"
                    >
                      <div className="luxury-panel flex size-8 items-center justify-center rounded-full text-xs font-medium text-luxury-ink dark:bg-muted/40 dark:text-foreground">
                        {index + 1}
                      </div>
                      <div className="luxury-panel rounded-[1.2rem] px-4 py-3 dark:bg-muted/30">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                          <p className="text-sm font-medium text-luxury-ink dark:text-foreground">
                            {layer.title}
                          </p>
                          <p className="luxury-meta text-xs uppercase tracking-[0.18em]">
                            {layer.stage}
                          </p>
                        </div>
                        <p className="luxury-copy mt-1 text-sm leading-6 dark:text-muted-foreground">
                          {layer.items.length
                            ? `${layer.items.slice(0, 3).map((item) => item.name).join(", ")}${layer.items.length > 3 ? ", and more." : "."}`
                            : "No detailed note callout available for this phase."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-[1.75rem] border-0 bg-[radial-gradient(circle_at_top,#8a6429_0%,#3d2b18_58%,#1d150d_100%)] text-[#fbf5ec] shadow-[0_18px_45px_rgba(23,18,14,0.28)] sm:rounded-[2rem]">
          <CardHeader className="border-b border-white/10 px-4 pb-5 sm:px-6 sm:pb-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="border border-white/10 bg-white/10 text-[#fbf2e6] hover:bg-white/10">
                Wear profile
              </Badge>
              {leadSeason ? (
                <Badge className="border border-white/10 bg-white/5 text-[#eadbc2] hover:bg-white/5">
                  Best in {toTitleLabel(leadSeason.name)}
                </Badge>
              ) : null}
            </div>
            <div className="space-y-3">
              <CardTitle className="text-2xl tracking-tight text-[#fbf5ec] sm:text-3xl">
                Performance board with longevity, projection, and context fit.
              </CardTitle>
              <p className="text-sm leading-7 text-[#ddcfbe]">
                Built like a scent report: how long it lasts, how far it travels, and where it
                fits best across seasons and occasions.
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:rounded-[1.6rem] sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[#dcccb8]">
                      Longevity
                    </p>
                    <p className="mt-2 text-xl font-medium tracking-tight text-[#fff8ef] sm:text-2xl">
                      {longevityProfile.label}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#e1d3c3]">
                      {longevityProfile.summary}
                    </p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/10 p-3 text-[#f1d8aa]">
                    <Clock3 className="size-5" />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="grid grid-cols-4 gap-2 text-center text-[9px] uppercase tracking-[0.2em] text-[#d8cab8] sm:text-[10px] sm:tracking-[0.24em]">
                    <span>2 hrs</span>
                    <span>4 hrs</span>
                    <span>8 hrs</span>
                    <span>12+ hrs</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#b18535,#f1d7a1)]"
                      style={{ width: `${longevityProfile.fill}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:rounded-[1.6rem] sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[#dcccb8]">
                      Sillage
                    </p>
                    <p className="mt-2 text-xl font-medium tracking-tight text-[#fff8ef] sm:text-2xl">
                      {sillageProfile.label}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#e1d3c3]">
                      {sillageProfile.summary}
                    </p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/10 p-3 text-[#f1d8aa]">
                    <Wind className="size-5" />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="grid grid-cols-4 gap-2 text-center text-[9px] uppercase tracking-[0.2em] text-[#d8cab8] sm:text-[10px] sm:tracking-[0.24em]">
                    <span>Skin</span>
                    <span>Personal</span>
                    <span>Room</span>
                    <span>Expansive</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#8f7046,#d8ba83)]"
                      style={{ width: `${sillageProfile.fill}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:rounded-[1.6rem] sm:p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[#dcccb8]">
                      Seasonal fit
                    </p>
                    <p className="mt-1 text-lg font-medium text-[#fff8ef]">
                      {leadSeason ? toTitleLabel(leadSeason.name) : "Not ranked yet"}
                    </p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/10 p-3 text-[#f1d8aa]">
                    <Droplets className="size-5" />
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {seasonRanking.length ? (
                    seasonRanking.map((season, index) => {
                      const percent = toRankingPercent(season.score)

                      return (
                        <div key={season.name} className="grid grid-cols-[auto_1fr] gap-2 sm:gap-3">
                          <div className="flex size-8 items-center justify-center rounded-full bg-white/10 text-xs font-medium text-[#fff8ef]">
                            {index + 1}
                          </div>
                          <div className="rounded-[1.2rem] bg-white/5 px-4 py-3">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                              <span className="text-sm font-medium text-[#fff8ef]">
                                {toTitleLabel(season.name)}
                              </span>
                              <span className="text-xs uppercase tracking-[0.18em] text-[#dcccb8]">
                                {season.score.toFixed(2)}
                              </span>
                            </div>
                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                              <div
                                className="h-full rounded-full bg-[linear-gradient(90deg,#c29a58,#f0d9ad)]"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-sm text-[#e1d3c3]">
                      No season ranking has been provided for this fragrance.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:rounded-[1.6rem] sm:p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[#dcccb8]">
                      Occasion fit
                    </p>
                    <p className="mt-1 text-lg font-medium text-[#fff8ef]">
                      {leadOccasion ? toTitleLabel(leadOccasion.name) : "Not ranked yet"}
                    </p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/10 p-3 text-[#f1d8aa]">
                    <Sparkles className="size-5" />
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {occasionRanking.length ? (
                    occasionRanking.map((occasion, index) => {
                      const percent = toRankingPercent(occasion.score)

                      return (
                        <div key={occasion.name} className="grid grid-cols-[auto_1fr] gap-2 sm:gap-3">
                          <div className="flex size-8 items-center justify-center rounded-full bg-white/10 text-xs font-medium text-[#fff8ef]">
                            {index + 1}
                          </div>
                          <div className="rounded-[1.2rem] bg-white/5 px-4 py-3">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                              <span className="text-sm font-medium text-[#fff8ef]">
                                {toTitleLabel(occasion.name)}
                              </span>
                              <span className="text-xs uppercase tracking-[0.18em] text-[#dcccb8]">
                                {occasion.score.toFixed(2)}
                              </span>
                            </div>
                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                              <div
                                className="h-full rounded-full bg-[linear-gradient(90deg,#b18535,#f1d7a1)]"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-sm text-[#e1d3c3]">
                      No occasion ranking has been provided for this fragrance.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="pb-12">
        <div className="mb-6 space-y-2">
          <Badge variant="secondary" className="text-muted-foreground">
            Related picks
          </Badge>
          <h2 className="font-heading text-3xl tracking-tight">
            More from same scent family.
          </h2>
        </div>
        <div className="grid auto-rows-fr items-stretch gap-6 md:grid-cols-2 xl:grid-cols-4">
          {related.map((item: (typeof related)[number]) => (
            <FragranceCard key={item.id} fragrance={item} />
          ))}
        </div>
      </section>
    </main>
  )
}
