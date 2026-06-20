export type HomepageFragrance = {
  id: string
  slug: string
  name: string
  brand: string
  family: string
  year: number | null
  price: string
  imageUrl: string
  transparentImageUrl: string
  oilType: string
  longevity: string
  sillage: string
  rating: number | null
  notes: string[]
  accords: string[]
  description: string
  purchaseUrl: string
}

export type HomepageFamily = {
  value: string
  label: string
  mood: string
  bestFor: string
  notes: string[]
  spotlight: string
}

export type HomepagePayload = {
  stats: {
    totalFragrances: number
    averageRating: number
    totalBrands: number
  }
  featured: HomepageFragrance | null
  collections: HomepageFragrance[]
  families: HomepageFamily[]
  topRated: HomepageFragrance[]
  recent: HomepageFragrance[]
  brands: string[]
}

type DbFragrance = {
  fragella_id: string
  slug: string
  name: string
  brand: string
  primary_family: string | null
  year: number | null
  price: number | null
  image_url: string | null
  image_url_transparent: string | null
  oil_type: string | null
  longevity: string | null
  sillage: string | null
  rating: number | null
  general_notes: unknown
  main_accords: unknown
  purchase_url: string | null
}

const FAMILY_META: Record<string, { mood: string; bestFor: string }> = {
  floral: {
    mood: "Soft, luminous, romantic",
    bestFor: "Date nights, spring dinners, bridal gifting",
  },
  woody: {
    mood: "Grounded, magnetic, elegant",
    bestFor: "Tailoring, office wear, evening layering",
  },
  amber: {
    mood: "Warm, opulent, addictive",
    bestFor: "Cold nights, festive events, collector shelves",
  },
  fresh: {
    mood: "Clean, airy, effortless",
    bestFor: "Daily wear, gifting, summer escapes",
  },
}

const VISUAL_BRAND_BONUS: Record<string, number> = {
  "Maison Francis Kurkdjian": 24,
  "Parfums de Marly": 22,
  Initio: 20,
  Byredo: 18,
  "Tom Ford": 18,
  Kayali: 16,
  Chanel: 14,
  Dior: 14,
  "Yves Saint Laurent": 14,
  "Frederic Malle": 14,
  Amouage: 12,
  Guerlain: 12,
  "The House of Oud": 12,
  Xerjoff: 12,
}

const CURATED_NAME_BONUS = [
  { keywords: ["delina"], score: 32 },
  { keywords: ["baccarat", "rouge", "540"], score: 28 },
  { keywords: ["oud", "for", "greatness"], score: 28 },
  { keywords: ["lost", "cherry"], score: 24 },
  { keywords: ["libre"], score: 20 },
  { keywords: ["good", "girl"], score: 18 },
  { keywords: ["mojave", "ghost"], score: 18 },
  { keywords: ["angels", "share"], score: 18 },
  { keywords: ["portrait", "of", "a", "lady"], score: 16 },
  { keywords: ["gentle", "fluidity", "gold"], score: 16 },
]

const HOMEPAGE_EXCLUDED_MATCHERS = [
  ["bleu", "de", "chanel"],
  ["chanel", "no", "5"],
  ["chanel", "n", "5"],
  ["fucking", "fabulous"],
]

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string")
  }

  return []
}

function formatPrice(value: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "Price on request"
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value)
}

function formatDescription(item: HomepageFragrance) {
  const accordText = item.accords.slice(0, 3).join(", ")
  return `${item.oilType} with ${accordText || "signature"} character and a ${item.sillage.toLowerCase()} trail.`
}

function normalizeForMatch(value: string | null | undefined) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function hasDisplayImage(row: DbFragrance) {
  return Boolean(row.image_url_transparent || row.image_url)
}

function isHomepageExcluded(row: DbFragrance) {
  const haystack = normalizeForMatch(`${row.brand} ${row.name}`)

  return HOMEPAGE_EXCLUDED_MATCHERS.some((keywords) =>
    keywords.every((keyword) => haystack.includes(keyword))
  )
}

function getVisualMerchScore(row: DbFragrance, index: number) {
  const haystack = normalizeForMatch(`${row.brand} ${row.name}`)
  const brandBonus = VISUAL_BRAND_BONUS[row.brand] || 0
  const nameBonus = CURATED_NAME_BONUS.reduce((total, entry) => {
    return entry.keywords.every((keyword) => haystack.includes(keyword)) ? total + entry.score : total
  }, 0)
  const imageBonus = row.image_url_transparent ? 40 : row.image_url ? 24 : -30
  const ratingBonus = typeof row.rating === "number" ? row.rating * 6 : 0
  const oilTypeBonus = row.oil_type?.toLowerCase().includes("extrait") ? 8 : 0
  const recencyBonus = typeof row.year === "number" ? Math.max(0, row.year - 2018) : 0
  const rankBonus = Math.max(0, 30 - index)

  return imageBonus + ratingBonus + oilTypeBonus + recencyBonus + rankBonus + brandBonus + nameBonus
}

function sortByVisualMerch(rows: DbFragrance[]) {
  return [...rows].sort((left, right) => {
    const leftIndex = rows.indexOf(left)
    const rightIndex = rows.indexOf(right)
    return getVisualMerchScore(right, rightIndex) - getVisualMerchScore(left, leftIndex)
  })
}

function pickBalancedRows(
  rows: DbFragrance[],
  count: number,
  options?: {
    excludeSlugs?: Set<string>
    maxPerFamily?: number
    requireImage?: boolean
  }
) {
  const picks: DbFragrance[] = []
  const familyCounts = new Map<string, number>()
  const chosenSlugs = new Set(options?.excludeSlugs || [])
  const maxPerFamily = options?.maxPerFamily ?? Math.max(2, Math.ceil(count / 3))

  const ordered = sortByVisualMerch(rows)
  const primaryPass = options?.requireImage === false ? ordered : ordered.filter(hasDisplayImage)

  for (const row of primaryPass) {
    if (chosenSlugs.has(row.slug)) continue

    const family = row.primary_family || "fresh"
    const countForFamily = familyCounts.get(family) || 0
    if (countForFamily >= maxPerFamily) continue

    picks.push(row)
    chosenSlugs.add(row.slug)
    familyCounts.set(family, countForFamily + 1)

    if (picks.length === count) {
      return picks
    }
  }

  for (const row of ordered) {
    if (chosenSlugs.has(row.slug)) continue

    picks.push(row)
    chosenSlugs.add(row.slug)

    if (picks.length === count) {
      return picks
    }
  }

  return picks
}

export function mapRowToHomepageFragrance(row: DbFragrance): HomepageFragrance {
  const notes = toArray(row.general_notes).slice(0, 3)
  const accords = toArray(row.main_accords).slice(0, 4)

  const item: HomepageFragrance = {
    id: row.fragella_id,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    family: row.primary_family || "fresh",
    year: row.year,
    price: formatPrice(row.price),
    imageUrl: row.image_url || "",
    transparentImageUrl: row.image_url_transparent || row.image_url || "",
    oilType: row.oil_type || "Fragrance",
    longevity: row.longevity || "Moderate",
    sillage: row.sillage || "Moderate",
    rating: typeof row.rating === "number" ? row.rating : null,
    notes,
    accords,
    description: "",
    purchaseUrl: row.purchase_url || "#",
  }

  item.description = formatDescription(item)

  return item
}

export function buildHomepagePayload(rows: DbFragrance[]): HomepagePayload {
  const homepageRows = rows.filter((row) => !isHomepageExcluded(row))
  const curatedRows = homepageRows.length ? homepageRows : rows
  const collectionRows = pickBalancedRows(curatedRows, 9, { maxPerFamily: 3 })
  const featuredRow =
    collectionRows[0] || sortByVisualMerch(curatedRows).find(hasDisplayImage) || curatedRows[0] || null
  const usedCollectionSlugs = new Set(collectionRows.map((item) => item.slug))
  const topRatedRows = pickBalancedRows(
    [...curatedRows].sort((a, b) => (b.rating || 0) - (a.rating || 0)),
    3,
    { excludeSlugs: usedCollectionSlugs, maxPerFamily: 2 }
  )
  const recentRows = pickBalancedRows(
    [...curatedRows].sort((a, b) => (b.year || 0) - (a.year || 0)),
    3,
    { excludeSlugs: new Set([...usedCollectionSlugs, ...topRatedRows.map((item) => item.slug)]), maxPerFamily: 2 }
  )
  const items = rows.map(mapRowToHomepageFragrance)
  const collectionItems = collectionRows.map(mapRowToHomepageFragrance)
  const topRatedItems = topRatedRows.map(mapRowToHomepageFragrance)
  const recentItems = recentRows.map(mapRowToHomepageFragrance)
  const rated = items.filter((item) => typeof item.rating === "number")
  const brands = new Set(items.map((item) => item.brand))

  const families = (["floral", "woody", "amber", "fresh"] as const).map((family) => {
    const familyItems = collectionItems.filter((item) => item.family === family)
    const notes = Array.from(
      new Set(familyItems.flatMap((item) => item.notes).filter(Boolean))
    ).slice(0, 4)

    return {
      value: family,
      label: family.charAt(0).toUpperCase() + family.slice(1),
      mood: FAMILY_META[family].mood,
      bestFor: FAMILY_META[family].bestFor,
      notes,
      spotlight: familyItems[0]?.name || `${family.charAt(0).toUpperCase() + family.slice(1)} Edit`,
    }
  })

  return {
    stats: {
      totalFragrances: items.length,
      averageRating: rated.length
        ? Number((rated.reduce((sum, item) => sum + (item.rating || 0), 0) / rated.length).toFixed(2))
        : 0,
      totalBrands: brands.size,
    },
    featured: featuredRow ? mapRowToHomepageFragrance(featuredRow) : null,
    collections: collectionItems,
    families,
    topRated: topRatedItems.length ? topRatedItems : collectionItems.slice(0, 3),
    recent: recentItems.length ? recentItems : collectionItems.slice(3, 6),
    brands: Array.from(new Set(items.map((item) => item.brand))).slice(0, 8),
  }
}
