"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react"
import type { PanInfo } from "motion/react"
import {
  ArrowLeft,
  ArrowRight,
  Droplets,
  FlaskConical,
  Gift,
  HeartHandshake,
  Leaf,
  Sparkles,
} from "lucide-react"

import SplitText from "@/components/SplitText"
import { FragranceCard } from "@/components/fragrance-card"
import { RevealOnScroll } from "@/components/reveal-on-scroll"
import { ScrollProgress } from "@/components/scroll-progress"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { HomepageFamily, HomepageFragrance, HomepagePayload } from "@/lib/catalog"

function buildBottleImage(prompt: string, imageSize = "portrait_4_3") {
  return `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${imageSize}`
}

const fallbackCollections: HomepageFragrance[] = [
  {
    id: "velvet-rose-extrait",
    slug: "velvet-rose-extrait",
    name: "Velvet Rose Extrait",
    brand: "Alburaq Atelier",
    family: "floral",
    year: 2026,
    price: "$148",
    imageUrl: buildBottleImage(
      "luxury perfume bottle, faceted blush glass, rose gold cap, soft pink liquid, elegant floral branding, centered studio product photography, isolated hero shot, premium beauty campaign lighting, realistic high-end packaging"
    ),
    transparentImageUrl: buildBottleImage(
      "luxury perfume bottle, faceted blush glass, rose gold cap, soft pink liquid, elegant floral branding, centered studio product photography, isolated hero shot, premium beauty campaign lighting, realistic high-end packaging"
    ),
    oilType: "Extrait de Parfum",
    longevity: "Long Lasting",
    sillage: "Strong",
    rating: 4.9,
    notes: ["Damask rose", "Pink pepper", "Amber resin"],
    accords: ["rose", "amber", "spice"],
    description: "A plush evening rose wrapped in spice, satin musk, and warm skin.",
    purchaseUrl: "#collections",
  },
  {
    id: "noir-cedar-elixir",
    slug: "noir-cedar-elixir",
    name: "Noir Cedar Elixir",
    brand: "Alburaq Atelier",
    family: "woody",
    year: 2026,
    price: "$164",
    imageUrl: buildBottleImage(
      "luxury perfume bottle, smoky black glass with amber gradient, matte gunmetal cap, minimal label, refined woody fragrance aesthetic, centered studio product photo, isolated bottle, dramatic premium lighting, realistic"
    ),
    transparentImageUrl: buildBottleImage(
      "luxury perfume bottle, smoky black glass with amber gradient, matte gunmetal cap, minimal label, refined woody fragrance aesthetic, centered studio product photo, isolated bottle, dramatic premium lighting, realistic"
    ),
    oilType: "Extrait de Parfum",
    longevity: "Long Lasting",
    sillage: "Moderate",
    rating: 4.8,
    notes: ["Atlas cedar", "Black tea", "Vetiver"],
    accords: ["woods", "tea", "vetiver"],
    description: "Dry woods, polished leather, and a dark tea trail that feels tailored.",
    purchaseUrl: "#collections",
  },
  {
    id: "citrine-bloom",
    slug: "citrine-bloom",
    name: "Citrine Bloom",
    brand: "Alburaq Atelier",
    family: "fresh",
    year: 2026,
    price: "$132",
    imageUrl: buildBottleImage(
      "luxury perfume bottle, translucent citrine glass, polished silver cap, luminous citrus fragrance design, elegant rectangular silhouette, centered studio product photography, isolated bottle, bright premium beauty lighting, realistic"
    ),
    transparentImageUrl: buildBottleImage(
      "luxury perfume bottle, translucent citrine glass, polished silver cap, luminous citrus fragrance design, elegant rectangular silhouette, centered studio product photography, isolated bottle, bright premium beauty lighting, realistic"
    ),
    oilType: "Eau de Parfum",
    longevity: "Moderate",
    sillage: "Moderate",
    rating: 4.7,
    notes: ["Bergamot", "Orange blossom", "White musk"],
    accords: ["citrus", "neroli", "musk"],
    description: "Bright citrus light softens into delicate florals and clean musks.",
    purchaseUrl: "#collections",
  },
]

const fallbackScentFamilies: HomepageFamily[] = [
  {
    value: "floral",
    label: "Floral",
    mood: "Soft, luminous, romantic",
    bestFor: "Date nights, spring dinners, bridal gifting",
    notes: ["Rose absolute", "Peony nectar", "Iris butter", "Cashmere musk"],
    spotlight: "Velvet Rose Extrait",
  },
  {
    value: "woody",
    label: "Woody",
    mood: "Grounded, magnetic, elegant",
    bestFor: "Tailoring, office wear, evening layering",
    notes: ["Cedarwood", "Patchouli coeur", "Vetiver", "Saffron smoke"],
    spotlight: "Noir Cedar Elixir",
  },
  {
    value: "amber",
    label: "Amber",
    mood: "Warm, opulent, addictive",
    bestFor: "Cold nights, festive events, collector shelves",
    notes: ["Labdanum", "Vanilla bean", "Tonka", "Burnished oud"],
    spotlight: "Amber Veil Reserve",
  },
  {
    value: "fresh",
    label: "Fresh",
    mood: "Clean, airy, effortless",
    bestFor: "Daily wear, gifting, summer escapes",
    notes: ["Bergamot zest", "Neroli", "Green fig", "Skin musk"],
    spotlight: "Citrine Bloom",
  },
]

const faqs = [
  {
    question: "How do I choose the right scent online?",
    answer:
      "Start with the scent family tabs below, then choose between discovery sizes or the wardrobe set. Each fragrance includes note structure, mood, wear profile, and layering suggestions.",
  },
  {
    question: "Do you offer samples before a full bottle?",
    answer:
      "Yes. Our discovery edit includes six 2ml sprays plus a voucher redeemable toward any 50ml or 100ml bottle within 30 days.",
  },
  {
    question: "Are the perfumes long lasting?",
    answer:
      "Most of the core line wears for 8-12 hours on skin, with extrait styles lasting longer. Longevity guidance is listed on each collection card.",
  },
  {
    question: "Can I build a gift set?",
    answer:
      "Absolutely. Choose a bottle, travel spray, engraving card, and ribbon color. We prepare it as a boutique gift box with next-day dispatch in major cities.",
  },
]

const fallbackFeatured: HomepageFragrance = {
  id: "midnight-saffron",
  slug: "midnight-saffron",
  name: "Midnight Saffron",
  brand: "Alburaq Atelier",
  family: "amber",
  year: 2026,
  price: "$176",
  imageUrl: buildBottleImage(
    "luxury perfume bottle, deep amber glass, brushed gold cap, saffron inspired jewel tone details, sculptural high-end bottle silhouette, centered studio hero shot, isolated product photography, warm cinematic lighting, realistic"
  ),
  transparentImageUrl: buildBottleImage(
    "luxury perfume bottle, deep amber glass, brushed gold cap, saffron inspired jewel tone details, sculptural high-end bottle silhouette, centered studio hero shot, isolated product photography, warm cinematic lighting, realistic"
  ),
  oilType: "Extrait de Parfum",
  longevity: "10-12 hours",
  sillage: "Intimate to room-filling",
  rating: 4.9,
  notes: ["Saffron", "Osmanthus", "Cacao shell"],
  accords: ["amber", "suede", "cedar smoke"],
  description:
    "A spiced suede composition with saffron, osmanthus, cacao shell, and cedar smoke.",
  purchaseUrl: "#collections",
}

const fallbackHomepage: HomepagePayload = {
  stats: {
    totalFragrances: 28,
    averageRating: 4.9,
    totalBrands: 12,
  },
  featured: fallbackFeatured,
  collections: fallbackCollections,
  families: fallbackScentFamilies,
  topRated: fallbackCollections,
  recent: fallbackCollections,
  brands: ["Alburaq Atelier", "Dior", "Chanel", "Amouage"],
}

const HERO_ROTATION_MS = 5200
const HERO_EASE = [0.22, 1, 0.36, 1] as const
const HERO_SWIPE_OFFSET_THRESHOLD = 70
const HERO_SWIPE_VELOCITY_THRESHOLD = 520
const HERO_DRAG_RANGE = 160

function getHeroSlides(homepage: HomepagePayload) {
  const candidates = [homepage.featured, ...homepage.collections, ...homepage.topRated].filter(
    Boolean
  ) as HomepageFragrance[]
  const seen = new Set<string>()

  const slides = candidates.filter((item) => {
    if (seen.has(item.slug)) return false
    seen.add(item.slug)
    return true
  })

  return slides.length ? slides : [fallbackFeatured]
}

export default function Home() {
  const [homepage, setHomepage] = useState<HomepagePayload>(fallbackHomepage)
  const [activeSlide, setActiveSlide] = useState(0)
  const [slideDirection, setSlideDirection] = useState(1)
  const shouldReduceMotion = useReducedMotion()
  const dragX = useMotionValue(0)
  const shellRotate = useSpring(useTransform(dragX, [-HERO_DRAG_RANGE, 0, HERO_DRAG_RANGE], [-2.5, 0, 2.5]), {
    stiffness: 220,
    damping: 26,
    mass: 0.6,
  })
  const shellLift = useSpring(useTransform(dragX, [-HERO_DRAG_RANGE, 0, HERO_DRAG_RANGE], [4, 0, 4]), {
    stiffness: 220,
    damping: 28,
    mass: 0.7,
  })
  const bottleParallax = useSpring(useTransform(dragX, [-HERO_DRAG_RANGE, HERO_DRAG_RANGE], [-22, 22]), {
    stiffness: 200,
    damping: 28,
  })
  const notesParallax = useSpring(useTransform(dragX, [-HERO_DRAG_RANGE, HERO_DRAG_RANGE], [-14, 14]), {
    stiffness: 190,
    damping: 26,
  })
  const copyParallax = useSpring(useTransform(dragX, [-HERO_DRAG_RANGE, HERO_DRAG_RANGE], [18, -18]), {
    stiffness: 190,
    damping: 26,
  })
  const progressGlowX = useTransform(dragX, [-HERO_DRAG_RANGE, HERO_DRAG_RANGE], [-12, 12])

  useEffect(() => {
    let active = true

    async function loadHomepage() {
      try {
        const response = await fetch("/api/homepage", { cache: "no-store" })
        if (!response.ok) return

        const payload = (await response.json()) as Partial<HomepagePayload> & {
          empty?: boolean
        }

        if (!active || payload.empty || !payload.collections?.length || !payload.featured) {
          return
        }

        setHomepage({
          stats: payload.stats || fallbackHomepage.stats,
          featured: payload.featured,
          collections: payload.collections,
          families: payload.families?.length ? payload.families : fallbackHomepage.families,
          topRated: payload.topRated?.length ? payload.topRated : fallbackHomepage.topRated,
          recent: payload.recent?.length ? payload.recent : fallbackHomepage.recent,
          brands: payload.brands?.length ? payload.brands : fallbackHomepage.brands,
        })
      } catch {
        // Keep curated fallback content if catalog is not ready yet.
      }
    }

    loadHomepage()

    return () => {
      active = false
    }
  }, [])

  const heroSlides = getHeroSlides(homepage)
  const safeActiveSlide = activeSlide < heroSlides.length ? activeSlide : 0
  const currentHero =
    heroSlides[safeActiveSlide] || homepage.featured || homepage.collections[0] || fallbackFeatured
  const heroNotes = currentHero.notes?.length ? currentHero.notes : currentHero.accords
  const heroNoteItems = heroNotes.slice(0, 3).map((note, index) => ({
    name: note,
    label: index === 0 ? "Top" : index === 1 ? "Heart" : "Base",
    dotClass:
      index === 0
        ? "bg-amber-400"
        : index === 1
          ? "bg-rose-400"
          : "bg-emerald-500",
  }))

  function goToSlide(nextIndex: number, direction: number) {
    setSlideDirection(direction)
    setActiveSlide(nextIndex)
  }

  function showPreviousSlide() {
    goToSlide((safeActiveSlide - 1 + heroSlides.length) % heroSlides.length, -1)
  }

  function showNextSlide() {
    goToSlide((safeActiveSlide + 1) % heroSlides.length, 1)
  }

  function getSlideNavigationDirection(nextIndex: number) {
    if (nextIndex === safeActiveSlide) return slideDirection || 1
    if (safeActiveSlide === heroSlides.length - 1 && nextIndex === 0) return 1
    if (safeActiveSlide === 0 && nextIndex === heroSlides.length - 1) return -1
    return nextIndex > safeActiveSlide ? 1 : -1
  }

  function handleHeroDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (heroSlides.length <= 1) return

    const didSwipeNext =
      info.offset.x <= -HERO_SWIPE_OFFSET_THRESHOLD ||
      info.velocity.x <= -HERO_SWIPE_VELOCITY_THRESHOLD
    const didSwipePrevious =
      info.offset.x >= HERO_SWIPE_OFFSET_THRESHOLD ||
      info.velocity.x >= HERO_SWIPE_VELOCITY_THRESHOLD

    if (didSwipeNext) {
      showNextSlide()
      return
    }

    if (didSwipePrevious) {
      showPreviousSlide()
    }

    dragX.set(0)
  }

  useEffect(() => {
    if (heroSlides.length <= 1) return

    const rotation = window.setTimeout(() => {
      setSlideDirection(1)
      setActiveSlide((current) => (current + 1) % heroSlides.length)
    }, HERO_ROTATION_MS)

    return () => {
      window.clearTimeout(rotation)
    }
  }, [heroSlides.length, safeActiveSlide])

  useEffect(() => {
    dragX.set(0)
  }, [dragX, safeActiveSlide])

  return (
    <main className="relative flex-1 overflow-hidden">
      <ScrollProgress />

      <div className="flex w-full flex-col pb-6">
        <RevealOnScroll delay={0.05}>
          <section className="flex min-h-[calc(100svh-5.75rem)] items-center">
            <div className="relative w-full overflow-hidden">
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="absolute inset-0 h-full w-full object-cover"
              >
                <source src="/showcase.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(12,8,5,0.8),rgba(18,12,7,0.7)_38%,rgba(16,10,6,0.52)_68%,rgba(10,6,4,0.74)),radial-gradient(circle_at_top_left,rgba(177,133,53,0.2),transparent_28%),radial-gradient(circle_at_78%_20%,rgba(244,234,214,0.08),transparent_24%)]" />

              <div className="relative mx-auto grid min-h-[calc(100svh-5.75rem)] w-full max-w-[1600px] items-center gap-6 px-6 py-5 md:px-10 md:py-7 lg:grid-cols-[1.02fr_0.98fr] lg:px-16 lg:py-7">
                  <div className="flex h-full flex-col justify-center gap-4">
                    <div className="space-y-4">
                      <div className="space-y-4">
                        <SplitText
                          text="Wear the room before you say a word."
                          tag="h1"
                          splitType="words, chars"
                          delay={28}
                          duration={0.85}
                          textAlign="left"
                          className="max-w-[34rem] font-heading text-3xl leading-none tracking-tight text-white sm:text-4xl lg:text-[3.9rem]"
                          from={{ opacity: 0, y: 32 }}
                          to={{ opacity: 1, y: 0 }}
                        />

                        <p className="max-w-lg text-sm leading-6 text-white/78 md:text-[0.95rem]">
                          A cinematic first impression for collectors, gifters, and anyone
                          curating a scent wardrobe. Explore transparent bottle visuals,
                          signature accords, and house favorites in motion.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2.5">
                        <Button size="sm" className="rounded-full px-5" asChild>
                          <Link href="/perfumes">
                            Explore signature bottles
                            <ArrowRight />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                        className="rounded-full border-white/20 bg-white/10 px-5 text-white backdrop-blur-sm hover:bg-white/16 dark:border-white/20 dark:bg-white/10"
                          asChild
                        >
                          <Link href={`/perfumes/${currentHero.slug}`}>Shop this featured scent</Link>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <motion.div
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
                      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.7, ease: HERO_EASE }}
                      className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-[linear-gradient(155deg,rgba(248,243,235,0.94),rgba(235,224,208,0.96)_56%,rgba(214,194,162,0.82))] p-3 shadow-[0_34px_90px_rgba(20,11,4,0.3)] backdrop-blur-md dark:border-white/10 dark:bg-[linear-gradient(155deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03)_56%,rgba(177,133,53,0.12))]"
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(255,255,255,0.78),transparent_24%),radial-gradient(circle_at_84%_22%,rgba(177,133,53,0.24),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.24),transparent_40%,rgba(67,51,39,0.08))] dark:bg-[radial-gradient(circle_at_18%_16%,rgba(255,255,255,0.08),transparent_24%),radial-gradient(circle_at_84%_22%,rgba(177,133,53,0.18),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_40%,rgba(0,0,0,0.16))]" />
                      <div className="pointer-events-none absolute left-5 right-5 top-[3.55rem] h-px bg-[linear-gradient(90deg,transparent,rgba(177,133,53,0.45),transparent)]" />

                      <div className="relative flex items-center justify-between gap-3 px-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-luxury-ink px-3.5 py-1.5 text-[10px] font-medium tracking-[0.24em] uppercase text-white shadow-[0_10px_20px_rgba(67,51,39,0.22)]">
                            Featured edit
                          </span>
                          <span className="rounded-full border border-[#b18535]/20 bg-white/72 px-3.5 py-1.5 text-[10px] font-medium tracking-[0.24em] uppercase text-luxury-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-sm dark:border-white/10 dark:bg-white/8 dark:text-foreground">
                            {currentHero.oilType || "Fragrance"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon-sm"
                            className="rounded-full border-[#b18535]/18 bg-white/76 text-luxury-ink shadow-[0_10px_24px_rgba(67,51,39,0.12)] hover:bg-white dark:border-white/10 dark:bg-white/6 dark:text-foreground"
                            disabled={heroSlides.length <= 1}
                            onClick={showPreviousSlide}
                            aria-label="Previous featured perfume"
                          >
                            <ArrowLeft />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon-sm"
                            className="rounded-full border-[#b18535]/18 bg-white/76 text-luxury-ink shadow-[0_10px_24px_rgba(67,51,39,0.12)] hover:bg-white dark:border-white/10 dark:bg-white/6 dark:text-foreground"
                            disabled={heroSlides.length <= 1}
                            onClick={showNextSlide}
                            aria-label="Next featured perfume"
                          >
                            <ArrowRight />
                          </Button>
                        </div>
                      </div>

                      <div className="relative mt-2 min-h-[21rem] overflow-hidden px-2 py-2 md:min-h-[23rem]">
                        <AnimatePresence initial={false} mode="wait" custom={slideDirection}>
                          <motion.div
                            key={currentHero.id}
                            custom={slideDirection}
                            initial={
                              shouldReduceMotion
                                ? false
                                : {
                                    opacity: 0,
                                    x: slideDirection > 0 ? 110 : -110,
                                    y: 10,
                                    scale: 0.985,
                                    filter: "blur(12px)",
                                    clipPath:
                                      slideDirection > 0
                                        ? "inset(0 0 0 26%)"
                                        : "inset(0 26% 0 0)",
                                  }
                            }
                            animate={
                              shouldReduceMotion
                                ? { opacity: 1 }
                                : {
                                    opacity: 1,
                                    x: 0,
                                    y: 0,
                                    scale: 1,
                                    filter: "blur(0px)",
                                    clipPath: "inset(0 0 0 0)",
                                  }
                            }
                            exit={
                              shouldReduceMotion
                                ? { opacity: 0 }
                                : {
                                    opacity: 0,
                                    x: slideDirection > 0 ? -84 : 84,
                                    y: -4,
                                    scale: 1.01,
                                    filter: "blur(12px)",
                                    clipPath:
                                      slideDirection > 0
                                        ? "inset(0 24% 0 0)"
                                        : "inset(0 0 0 24%)",
                                  }
                            }
                            transition={{ duration: 0.9, ease: HERO_EASE }}
                            drag={heroSlides.length > 1 ? "x" : false}
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.12}
                            dragMomentum={false}
                            onDrag={(_, info) => dragX.set(info.offset.x)}
                            onDragEnd={handleHeroDragEnd}
                            whileDrag={
                              heroSlides.length > 1
                                ? { scale: 0.992, filter: "brightness(1.03)" }
                                : undefined
                            }
                            style={shouldReduceMotion ? undefined : { rotate: shellRotate, y: shellLift }}
                            className="absolute inset-0 cursor-grab select-none active:cursor-grabbing touch-pan-y"
                          >
                            <motion.div
                              aria-hidden="true"
                              initial={
                                shouldReduceMotion
                                  ? false
                                  : {
                                      opacity: 0,
                                      x: slideDirection > 0 ? "-42%" : "42%",
                                      rotate: slideDirection > 0 ? -10 : 10,
                                    }
                              }
                              animate={
                                shouldReduceMotion
                                  ? undefined
                                  : {
                                      opacity: [0, 0.62, 0],
                                      x:
                                        slideDirection > 0
                                          ? ["-42%", "148%"]
                                          : ["42%", "-148%"],
                                      rotate: slideDirection > 0 ? -10 : 10,
                                    }
                              }
                              transition={{ duration: 1.05, delay: 0.04, ease: HERO_EASE }}
                              className="pointer-events-none absolute inset-y-[-12%] left-[-18%] w-[42%] bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.56),rgba(255,255,255,0))] blur-2xl"
                            />

                            <motion.div
                              aria-hidden="true"
                              initial={
                                shouldReduceMotion
                                  ? false
                                  : { opacity: 0.22, x: slideDirection > 0 ? 0 : "auto" }
                              }
                              animate={
                                shouldReduceMotion
                                  ? undefined
                                  : {
                                      opacity: [0.2, 0],
                                      x: slideDirection > 0 ? ["0%", "110%"] : ["0%", "-110%"],
                                    }
                              }
                              transition={{ duration: 0.72, ease: HERO_EASE }}
                              className={`pointer-events-none absolute inset-y-0 ${slideDirection > 0 ? "left-0" : "right-0"} w-[30%] bg-[linear-gradient(90deg,rgba(227,210,178,0.34),rgba(255,255,255,0))]`}
                            />

                            <motion.div
                              aria-hidden="true"
                              initial={
                                shouldReduceMotion
                                  ? false
                                  : {
                                      opacity: 0,
                                      scale: 0.82,
                                      x: slideDirection > 0 ? -24 : 24,
                                    }
                              }
                              animate={
                                shouldReduceMotion
                                  ? undefined
                                  : {
                                      opacity: 0.95,
                                      scale: 1.08,
                                      x: 0,
                                      transition: { duration: 0.9, ease: HERO_EASE },
                                    }
                              }
                              exit={
                                shouldReduceMotion
                                  ? undefined
                                  : {
                                      opacity: 0,
                                      scale: 1.18,
                                      x: slideDirection > 0 ? 18 : -18,
                                    }
                              }
                              transition={{ duration: 0.9, ease: HERO_EASE }}
                              className="absolute inset-x-[18%] top-[10%] bottom-[18%] rounded-full bg-[radial-gradient(circle,rgba(255,250,242,0.72),rgba(255,255,255,0)_68%)] blur-3xl"
                            />

                            <motion.div
                              initial={
                                shouldReduceMotion
                                  ? false
                                  : { opacity: 0, y: -10, x: slideDirection > 0 ? 28 : -28 }
                              }
                              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, x: 0 }}
                              exit={
                                shouldReduceMotion
                                  ? undefined
                                  : { opacity: 0, y: -4, x: slideDirection > 0 ? -18 : 18 }
                              }
                              transition={{ duration: 0.52, delay: 0.18, ease: HERO_EASE }}
                              className="absolute right-3 top-3 text-right"
                            >
                              <p className="luxury-meta text-[10px] uppercase tracking-[0.24em]">
                                Slide {String(safeActiveSlide + 1).padStart(2, "0")}
                              </p>
                              <p className="mt-1.5 text-xs text-luxury-muted dark:text-muted-foreground">
                                {currentHero.family}
                                {currentHero.year ? ` · ${currentHero.year}` : ""}
                              </p>
                            </motion.div>

                            <div className="relative flex min-h-[19rem] items-center justify-center px-2 py-3 md:min-h-[22rem]">
                              {currentHero.transparentImageUrl || currentHero.imageUrl ? (
                                <motion.div
                                  initial={
                                    shouldReduceMotion
                                      ? false
                                      : {
                                          opacity: 0,
                                          y: 14,
                                          x: slideDirection > 0 ? 96 : -96,
                                          scale: 0.96,
                                          rotate: slideDirection > 0 ? -4 : 4,
                                          filter: "blur(6px)",
                                          clipPath:
                                            slideDirection > 0
                                              ? "inset(0 0 0 22%)"
                                              : "inset(0 22% 0 0)",
                                        }
                                  }
                                  animate={
                                    shouldReduceMotion
                                      ? undefined
                                      : {
                                          opacity: 1,
                                          x: [slideDirection > 0 ? 54 : -54, 0],
                                          y: [8, 0],
                                          scale: [0.98, 1.03, 1],
                                          rotate: [slideDirection > 0 ? -4 : 4, 0],
                                          filter: "blur(0px)",
                                          clipPath: "inset(0 0 0 0)",
                                        }
                                  }
                                  exit={
                                    shouldReduceMotion
                                      ? undefined
                                      : {
                                          opacity: 0,
                                          x: slideDirection > 0 ? -72 : 72,
                                          y: -6,
                                          scale: 1.01,
                                          rotate: slideDirection > 0 ? 3 : -3,
                                          filter: "blur(6px)",
                                          clipPath:
                                            slideDirection > 0
                                              ? "inset(0 18% 0 0)"
                                              : "inset(0 0 0 18%)",
                                        }
                                  }
                                  transition={{ duration: 1.02, ease: HERO_EASE }}
                                  className="absolute inset-0"
                                >
                                  <motion.div
                                    style={shouldReduceMotion ? undefined : { x: bottleParallax }}
                                    className="absolute inset-0"
                                  >
                                    <div className="pointer-events-none absolute inset-x-[16%] bottom-[13%] h-px bg-[linear-gradient(90deg,transparent,rgba(177,133,53,0.28),transparent)]" />
                                    <motion.div
                                      aria-hidden="true"
                                      initial={shouldReduceMotion ? false : { opacity: 0, scaleX: 0.7 }}
                                      animate={
                                        shouldReduceMotion
                                          ? undefined
                                          : { opacity: [0.1, 0.42, 0.16], scaleX: [0.78, 1.08, 0.92] }
                                      }
                                      transition={{
                                        duration: 2.4,
                                        delay: 0.16,
                                        ease: "easeInOut",
                                      }}
                                      className="absolute inset-x-[22%] bottom-[11%] h-[1px] origin-center bg-[linear-gradient(90deg,transparent,rgba(177,133,53,0.66),transparent)]"
                                    />
                                    <motion.div
                                      aria-hidden="true"
                                      animate={
                                        shouldReduceMotion
                                          ? undefined
                                          : {
                                              opacity: [0.18, 0.42, 0.24],
                                              scale: [0.88, 1.12, 0.94],
                                            }
                                      }
                                      transition={{
                                        duration: 4.6,
                                        repeat: Number.POSITIVE_INFINITY,
                                        ease: "easeInOut",
                                      }}
                                      className="absolute inset-x-[20%] bottom-[10%] h-12 rounded-full bg-[radial-gradient(circle,rgba(123,88,40,0.24),rgba(123,88,40,0)_72%)] blur-2xl"
                                    />
                                    <motion.div
                                      animate={
                                        shouldReduceMotion
                                          ? undefined
                                          : {
                                              y: [0, -10, 0, 6, 0],
                                              rotate: [0, 1.1, 0, -1, 0],
                                              scale: [1, 1.015, 1, 0.992, 1],
                                            }
                                      }
                                      transition={{
                                        duration: 6.6,
                                        repeat: Number.POSITIVE_INFINITY,
                                        ease: "easeInOut",
                                      }}
                                      className="relative h-full w-full"
                                    >
                                      <Image
                                        src={currentHero.transparentImageUrl || currentHero.imageUrl}
                                        alt={currentHero.name}
                                        fill
                                        unoptimized
                                        priority
                                        sizes="(max-width: 1024px) 100vw, 42rem"
                                        className="object-contain px-2 py-1 drop-shadow-[0_40px_52px_rgba(72,50,18,0.24)]"
                                      />
                                    </motion.div>
                                  </motion.div>
                                </motion.div>
                              ) : (
                                <div className="luxury-copy flex h-full w-full items-center justify-center rounded-[1.5rem] border border-dashed border-black/10 px-8 text-center text-sm dark:border-white/10">
                                  Transparent product image pending
                                </div>
                              )}
                            </div>

                            <motion.div
                              initial={
                                shouldReduceMotion
                                  ? false
                                  : {
                                      opacity: 0,
                                      x: slideDirection > 0 ? 72 : -72,
                                      y: 10,
                                      scale: 0.98,
                                      clipPath:
                                        slideDirection > 0
                                          ? "inset(0 0 0 20%)"
                                          : "inset(0 20% 0 0)",
                                    }
                              }
                              animate={
                                shouldReduceMotion
                                  ? undefined
                                  : { opacity: 1, x: 0, y: 0, scale: 1, clipPath: "inset(0 0 0 0)" }
                              }
                              exit={
                                shouldReduceMotion
                                  ? undefined
                                  : {
                                      opacity: 0,
                                      x: slideDirection > 0 ? -42 : 42,
                                      y: -4,
                                      scale: 1,
                                      clipPath:
                                        slideDirection > 0
                                          ? "inset(0 14% 0 0)"
                                          : "inset(0 0 0 14%)",
                                    }
                              }
                              transition={{ duration: 0.66, delay: 0.26, ease: HERO_EASE }}
                              className="absolute right-3 bottom-3 w-[12rem] rounded-[1.2rem] border border-white/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(248,240,228,0.92))] p-3.5 shadow-[0_18px_36px_rgba(67,51,39,0.13)] backdrop-blur-md dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))]"
                            >
                              <motion.div
                                style={shouldReduceMotion ? undefined : { x: notesParallax }}
                                className="h-full"
                              >
                                <p className="luxury-meta text-[10px] uppercase tracking-[0.24em]">
                                  Signature notes
                                </p>
                                <div className="mt-3 space-y-2.5">
                                  {heroNoteItems.map((note, index) => (
                                    <motion.div
                                      key={`${note.label}-${note.name}`}
                                      initial={
                                        shouldReduceMotion
                                          ? false
                                          : {
                                              opacity: 0,
                                              x: slideDirection > 0 ? 18 : -18,
                                              y: 2,
                                            }
                                      }
                                      animate={
                                        shouldReduceMotion ? undefined : { opacity: 1, x: 0, y: 0 }
                                      }
                                      transition={{ duration: 0.34, delay: 0.3 + index * 0.08 }}
                                      className="flex items-start gap-2.5"
                                    >
                                      <span
                                        className={`mt-1.5 size-2 shrink-0 rounded-full ${note.dotClass}`}
                                      />
                                      <div className="min-w-0">
                                        <p className="luxury-meta text-[9px] uppercase tracking-[0.2em]">
                                          {note.label}
                                        </p>
                                        <p className="truncate text-[11px] font-medium text-luxury-ink dark:text-foreground">
                                          {note.name}
                                        </p>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              </motion.div>
                            </motion.div>

                            <motion.div
                              initial={
                                shouldReduceMotion
                                  ? false
                                  : {
                                      opacity: 0,
                                      x: slideDirection > 0 ? 88 : -88,
                                      y: 14,
                                      scale: 0.98,
                                      clipPath:
                                        slideDirection > 0
                                          ? "inset(0 0 0 18%)"
                                          : "inset(0 18% 0 0)",
                                    }
                              }
                              animate={
                                shouldReduceMotion
                                  ? undefined
                                  : { opacity: 1, x: 0, y: 0, scale: 1, clipPath: "inset(0 0 0 0)" }
                              }
                              exit={
                                shouldReduceMotion
                                  ? undefined
                                  : {
                                      opacity: 0,
                                      x: slideDirection > 0 ? -54 : 54,
                                      y: -4,
                                      scale: 1,
                                      clipPath:
                                        slideDirection > 0
                                          ? "inset(0 12% 0 0)"
                                          : "inset(0 0 0 12%)",
                                    }
                              }
                              transition={{ duration: 0.72, delay: 0.34, ease: HERO_EASE }}
                              className="absolute bottom-3 left-3 right-3"
                            >
                              <motion.div
                                style={shouldReduceMotion ? undefined : { x: copyParallax }}
                                className="max-w-[22.5rem] rounded-[1.25rem] border border-white/58 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(245,236,223,0.94))] p-3.5 shadow-[0_18px_38px_rgba(67,51,39,0.14)] backdrop-blur-md dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))]"
                              >
                                <p className="luxury-meta text-[10px] uppercase tracking-[0.22em]">
                                  {currentHero.brand}
                                </p>
                                <h3 className="mt-2 text-[1.65rem] leading-[0.94] font-medium tracking-[-0.035em] text-luxury-ink dark:text-foreground">
                                  {currentHero.name}
                                </h3>
                                <p className="luxury-copy mt-2 line-clamp-2 text-[0.78rem] leading-5 dark:text-muted-foreground">
                                  {currentHero.description}
                                </p>
                              </motion.div>
                            </motion.div>
                          </motion.div>
                        </AnimatePresence>
                      </div>

                      {heroSlides.length > 1 ? (
                        <div className="mt-2 flex items-center gap-2 px-1">
                          {heroSlides.map((slide, index) => {
                            const isActive = index === safeActiveSlide

                            return (
                              <button
                                key={slide.id}
                                type="button"
                                className="group relative"
                                onClick={() =>
                                  goToSlide(index, getSlideNavigationDirection(index))
                                }
                                aria-label={`Go to featured perfume ${index + 1}`}
                              >
                                <span className="relative block h-1.5 w-11 overflow-hidden rounded-full bg-[#cab28a]/35 transition-colors group-hover:bg-[#b18535]/35">
                                  {isActive ? (
                                    <>
                                      <motion.span
                                        key={`${slide.id}-${safeActiveSlide}`}
                                        initial={shouldReduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={
                                          shouldReduceMotion
                                            ? { duration: 0 }
                                            : { duration: HERO_ROTATION_MS / 1000, ease: "linear" }
                                        }
                                        className="absolute inset-0 rounded-full bg-[linear-gradient(90deg,#b18535,#f0dfb8)]"
                                        style={{ originX: 0 }}
                                      />
                                      <motion.span
                                        aria-hidden="true"
                                        initial={shouldReduceMotion ? false : { opacity: 0 }}
                                        animate={
                                          shouldReduceMotion
                                            ? undefined
                                            : { opacity: [0.15, 0.5, 0.15] }
                                        }
                                        transition={{
                                          duration: 1.8,
                                          repeat: Number.POSITIVE_INFINITY,
                                          ease: "easeInOut",
                                        }}
                                        className="absolute inset-y-[-3px] w-5 rounded-full bg-white/55 blur-[6px]"
                                        style={shouldReduceMotion ? undefined : { x: progressGlowX }}
                                      />
                                    </>
                                  ) : null}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      ) : null}
                    </motion.div>
                  </div>
                </div>
            </div>
          </section>
        </RevealOnScroll>

        <div className="mx-auto flex w-full max-w-7xl flex-col px-6 md:px-10 lg:px-12">
          <RevealOnScroll delay={0.05}>
            <section
              id="collections"
              className="grid gap-5 border-t border-border/60 py-14"
            >
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="space-y-3">
                <Badge variant="secondary" className="text-muted-foreground">
                  Signature collection
                </Badge>
                <h2 className="font-heading text-4xl tracking-tight">
                  Build a wardrobe of scents for every hour of the day.
                </h2>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                Start with iconic bottles, then expand into travel sprays, body ritual oils,
                and layered pairings recommended by our scent concierge.
              </p>
            </div>

            <div className="grid auto-rows-fr items-stretch gap-6 lg:grid-cols-3">
              {homepage.collections.map((item) => (
                <FragranceCard key={item.id} fragrance={item} />
              ))}
            </div>
            </section>
          </RevealOnScroll>

          <RevealOnScroll delay={0.05}>
            <section
              id="finder"
              className="grid gap-8 border-t border-border/60 py-14 lg:grid-cols-[0.72fr_1.28fr]"
            >
            <div className="space-y-4">
              <Badge variant="secondary" className="text-muted-foreground">
                Scent finder
              </Badge>
              <h2 className="font-heading text-4xl tracking-tight">
                Match your mood before you commit to a full bottle.
              </h2>
              <p className="text-sm leading-7 text-muted-foreground">
                Browse by fragrance family, compare note pyramids, and start with a discovery
                ritual if you want to test on skin.
              </p>
            </div>

            <Tabs defaultValue={homepage.families[0]?.value || "floral"} className="gap-6">
              <TabsList variant="line" className="flex w-full flex-wrap justify-start gap-2 p-0">
                {homepage.families.map((family) => (
                  <TabsTrigger
                    key={family.value}
                    value={family.value}
                    className="border border-border/60 px-4"
                  >
                    {family.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {homepage.families.map((family) => (
                <TabsContent key={family.value} value={family.value}>
                  <Card className="border border-border/60 bg-card/95">
                    <CardContent className="grid gap-8 px-6 py-6 lg:grid-cols-[1fr_auto]">
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <CardTitle className="text-2xl tracking-[0.18em] normal-case">
                            {family.label} signatures
                          </CardTitle>
                          <CardDescription>
                            Mood: {family.mood}. Best for: {family.bestFor}.
                          </CardDescription>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          {family.notes.map((note) => (
                            <div
                              key={note}
                              className="flex items-center gap-3 border border-border/60 px-4 py-3"
                            >
                              <Droplets className="size-4 text-muted-foreground" />
                              <span className="text-sm">{note}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Button asChild>
                            <Link href={`/perfumes?family=${family.value}`}>
                              Browse {family.label.toLowerCase()}
                              <ArrowRight />
                            </Link>
                          </Button>
                          <Button variant="outline" asChild>
                            <Link href={`/perfumes?family=${family.value}`}>
                              Spotlight: {family.spotlight}
                            </Link>
                          </Button>
                        </div>
                      </div>

                      <Card className="min-w-[18rem] border border-border/60 bg-muted/30">
                        <CardHeader>
                          <Badge className="text-muted-foreground">Layering cue</Badge>
                          <CardTitle className="text-xl tracking-[0.14em] normal-case">
                            Pair with body ritual oil
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
                          <p>
                            Extend projection and smooth the dry-down with a matching oil and
                            travel spray set.
                          </p>
                          <div className="grid gap-3">
                            <div className="flex items-center gap-3">
                              <Leaf className="size-4" />
                              Refillable atomizer
                            </div>
                            <div className="flex items-center gap-3">
                              <FlaskConical className="size-4" />
                              Guided layering notes
                            </div>
                            <div className="flex items-center gap-3">
                              <Gift className="size-4" />
                              Boutique-ready gift wrap
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
            </section>
          </RevealOnScroll>

          <RevealOnScroll delay={0.05}>
            <section
              id="gifting"
              className="grid gap-6 border-t border-border/60 py-14 lg:grid-cols-[0.95fr_1.05fr]"
            >
            <Card className="border border-border/60 bg-card/95">
              <CardHeader>
                <Badge variant="secondary" className="text-muted-foreground">
                  Discovery and gifting
                </Badge>
                <CardTitle className="text-3xl tracking-[0.16em] normal-case">
                  Start small, then redeem into a full-sized signature.
                </CardTitle>
                <CardDescription>
                  A boutique-style entry point for first-time buyers, thoughtful gifting, and
                  multi-scent layering.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3 border border-border/60 px-4 py-4">
                  <Gift className="mt-0.5 size-4" />
                  <div>
                    <p className="font-medium text-foreground">Discovery Edit</p>
                    <p>Six bestselling scents, redeemable voucher, note guide, and wear map.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 border border-border/60 px-4 py-4">
                  <Sparkles className="mt-0.5 size-4" />
                  <div>
                    <p className="font-medium text-foreground">Collector Gift Box</p>
                    <p>50ml bottle, engraved card, ribbon choice, and matching travel spray.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 border border-border/60 px-4 py-4">
                  <HeartHandshake className="mt-0.5 size-4" />
                  <div>
                    <p className="font-medium text-foreground">Private Scent Concierge</p>
                    <p>Message-based recommendations for gifting, events, and wardrobe building.</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="gap-3 border-t border-border/60">
                <Button>Shop discovery set</Button>
                <Button variant="outline">Talk to concierge</Button>
              </CardFooter>
            </Card>

            <Card className="border border-border/60 bg-card/95">
              <CardHeader>
                <Badge variant="secondary" className="text-muted-foreground">
                  New in catalog
                </Badge>
                <CardTitle className="text-3xl tracking-[0.16em] normal-case">
                  Fresh arrivals and house highlights from live inventory.
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="divide-y divide-border/60 border-y border-border/60">
                  {homepage.recent.map((item) => {
                    const imageSrc = item.transparentImageUrl || item.imageUrl
                    const notePreview = item.notes.slice(0, 3).join(" · ") || item.accords.slice(0, 3).join(" · ")
                    const brandLine = [item.brand, item.year].filter(Boolean).join(" · ")

                    return (
                      <article
                        key={item.id}
                        className="grid gap-4 py-5 md:grid-cols-[132px_minmax(0,1fr)_auto] md:items-center"
                      >
                        <Link
                          href={`/perfumes/${item.slug}`}
                          className="luxury-canvas relative mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-[1.35rem] border border-border/50 bg-background/70 p-3 md:mx-0"
                        >
                          <Image
                            src={imageSrc}
                            alt={item.name}
                            fill
                            unoptimized
                            sizes="128px"
                            className="object-contain p-3"
                          />
                        </Link>

                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">{item.family}</Badge>
                            <Badge variant="secondary">{item.oilType}</Badge>
                          </div>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            {brandLine}
                          </p>
                          <Link href={`/perfumes/${item.slug}`} className="block">
                            <h3 className="text-2xl font-medium tracking-[-0.03em] text-luxury-ink transition-colors hover:text-primary">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="text-sm leading-7 text-muted-foreground">
                            {item.description}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {notePreview}
                          </p>
                        </div>

                        <div className="flex flex-col gap-3 md:items-end">
                          <p className="text-2xl font-medium tracking-[-0.03em] text-luxury-ink">
                            {item.price}
                          </p>
                          <Button variant="outline" asChild>
                            <Link href={`/perfumes/${item.slug}`}>View details</Link>
                          </Button>
                        </div>
                      </article>
                    )
                  })}
                </div>

                <div className="flex flex-wrap gap-2">
                  {homepage.brands.map((brand) => (
                    <Link key={brand} href={`/perfumes?q=${encodeURIComponent(brand)}`}>
                      <Badge variant="secondary">{brand}</Badge>
                    </Link>
                  ))}
                </div>

                <p className="text-sm leading-7 text-muted-foreground">
                  Catalog updates follow live Supabase data, so new imports can surface here
                  automatically as Fragella quota refreshes.
                </p>
              </CardContent>
            </Card>
            </section>
          </RevealOnScroll>

          <RevealOnScroll delay={0.05}>
            <section className="grid gap-6 border-t border-border/60 py-14 lg:grid-cols-[0.75fr_1.25fr]">
            <div className="space-y-4">
              <Badge variant="secondary" className="text-muted-foreground">
                Frequently asked
              </Badge>
              <h2 className="font-heading text-4xl tracking-tight">
                Everything you need before choosing your next signature.
              </h2>
            </div>

            <Card className="border border-border/60 bg-card/95">
              <CardContent className="px-6 py-2">
                <Accordion type="single" collapsible>
                  {faqs.map((item) => (
                    <AccordionItem key={item.question} value={item.question}>
                      <AccordionTrigger>{item.question}</AccordionTrigger>
                      <AccordionContent>{item.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
            </section>
          </RevealOnScroll>

          <RevealOnScroll delay={0.05}>
            <section className="border-t border-border/60 py-12">
            <Card className="border border-border/60 bg-[linear-gradient(135deg,rgba(177,133,53,0.12),rgba(244,234,214,0.9))]">
              <CardContent className="flex flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between md:px-10">
                <div className="space-y-3">
                  <Badge variant="secondary" className="text-muted-foreground">
                    Ready for your ritual?
                  </Badge>
                  <h2 className="font-heading text-4xl tracking-tight">
                    Choose a bottle, a discovery set, or a concierge-guided gift.
                  </h2>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button size="lg" asChild>
                    <Link href="/perfumes">Shop perfumes</Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/perfumes?sort=rating">Start with top rated</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            </section>
          </RevealOnScroll>

        </div>
      </div>
    </main>
  )
}
