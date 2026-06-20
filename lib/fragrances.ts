import { getSupabaseAdmin } from "@/lib/supabase-admin"

export type FragranceNote = {
  name: string
  imageUrl?: string
}

export type FragranceRanking = {
  name: string
  score: number
}

export type Fragrance = {
  id: string
  slug: string
  name: string
  brand: string
  family: string
  year: number | null
  rating: number | null
  country: string | null
  price: number | null
  gender: string | null
  oilType: string | null
  longevity: string | null
  sillage: string | null
  confidence: string | null
  popularity: string | null
  priceValue: string | null
  imageUrl: string | null
  transparentImageUrl: string | null
  imageFallbacks: string[]
  purchaseUrl: string | null
  generalNotes: string[]
  accords: string[]
  accordStrengths: Record<string, string>
  seasonRanking: FragranceRanking[]
  occasionRanking: FragranceRanking[]
  notes: {
    top: FragranceNote[]
    middle: FragranceNote[]
    base: FragranceNote[]
  }
  sourceBrand: string | null
  sortScore: number
}

export type FragranceListFilters = {
  query?: string
  family?: string
  sort?: string
  page?: number
  perPage?: number
}

type FragranceRow = {
  fragella_id: string
  slug: string
  name: string
  brand: string
  primary_family: string | null
  year: number | null
  rating: number | null
  country: string | null
  price: number | null
  gender: string | null
  oil_type: string | null
  longevity: string | null
  sillage: string | null
  confidence: string | null
  popularity: string | null
  price_value: string | null
  image_url: string | null
  image_url_transparent: string | null
  image_fallbacks: unknown
  purchase_url: string | null
  general_notes: unknown
  main_accords: unknown
  main_accords_percentage: unknown
  season_ranking: unknown
  occasion_ranking: unknown
  notes: unknown
  source_brand: string | null
  sort_score: number | null
}

const BASE_SELECT = `
  fragella_id,
  slug,
  name,
  brand,
  primary_family,
  year,
  rating,
  country,
  price,
  gender,
  oil_type,
  longevity,
  sillage,
  confidence,
  popularity,
  price_value,
  image_url,
  image_url_transparent,
  image_fallbacks,
  purchase_url,
  general_notes,
  main_accords,
  main_accords_percentage,
  season_ranking,
  occasion_ranking,
  notes,
  source_brand,
  sort_score
`

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === "string")
}

function toRankingArray(value: unknown): FragranceRanking[] {
  if (!Array.isArray(value)) return []

  const items = value
    .map((item) => {
      if (!item || typeof item !== "object") return null
      const row = item as { name?: unknown; score?: unknown }
      if (typeof row.name !== "string" || typeof row.score !== "number") return null
      return { name: row.name, score: row.score }
    })

  return items.filter((item): item is FragranceRanking => item !== null)
}

function toNoteArray(value: unknown): FragranceNote[] {
  if (!Array.isArray(value)) return []

  return value.reduce<FragranceNote[]>((acc, item) => {
    if (!item || typeof item !== "object") return acc
    const row = item as { name?: unknown; imageUrl?: unknown }
    if (typeof row.name !== "string") return acc

    acc.push({
      name: row.name,
      imageUrl: typeof row.imageUrl === "string" ? row.imageUrl : undefined,
    })

    return acc
  }, [])
}

function toAccordStrengths(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] =>
        typeof entry[0] === "string" && typeof entry[1] === "string"
    )
  )
}

function mapRow(row: FragranceRow): Fragrance {
  const notesObject =
    row.notes && typeof row.notes === "object" && !Array.isArray(row.notes)
      ? (row.notes as {
          Top?: unknown
          Middle?: unknown
          Base?: unknown
        })
      : {}

  return {
    id: row.fragella_id,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    family: row.primary_family || "fresh",
    year: row.year,
    rating: row.rating,
    country: row.country,
    price: row.price,
    gender: row.gender,
    oilType: row.oil_type,
    longevity: row.longevity,
    sillage: row.sillage,
    confidence: row.confidence,
    popularity: row.popularity,
    priceValue: row.price_value,
    imageUrl: row.image_url,
    transparentImageUrl: row.image_url_transparent,
    imageFallbacks: toStringArray(row.image_fallbacks),
    purchaseUrl: row.purchase_url,
    generalNotes: toStringArray(row.general_notes),
    accords: toStringArray(row.main_accords),
    accordStrengths: toAccordStrengths(row.main_accords_percentage),
    seasonRanking: toRankingArray(row.season_ranking),
    occasionRanking: toRankingArray(row.occasion_ranking),
    notes: {
      top: toNoteArray(notesObject.Top),
      middle: toNoteArray(notesObject.Middle),
      base: toNoteArray(notesObject.Base),
    },
    sourceBrand: row.source_brand,
    sortScore: row.sort_score || 0,
  }
}

function normalizeSort(sort?: string) {
  switch (sort) {
    case "price-asc":
    case "price-desc":
    case "rating":
    case "year":
      return sort
    default:
      return "featured"
  }
}

export function formatPrice(value: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "Price on request"

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value)
}

export async function listFragrances(filters: FragranceListFilters = {}) {
  const supabase = getSupabaseAdmin()
  const page = Math.max(1, filters.page || 1)
  const perPage = Math.min(24, Math.max(1, filters.perPage || 12))
  const sort = normalizeSort(filters.sort)
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  let query = supabase
    .from("fragrances")
    .select(BASE_SELECT, { count: "exact" })
    .range(from, to)

  if (filters.family && filters.family !== "all") {
    query = query.eq("primary_family", filters.family)
  }

  if (filters.query) {
    const term = filters.query.trim()
    if (term) {
      query = query.or(
        `name.ilike.%${term}%,brand.ilike.%${term}%,primary_family.ilike.%${term}%,oil_type.ilike.%${term}%,longevity.ilike.%${term}%,sillage.ilike.%${term}%,gender.ilike.%${term}%,country.ilike.%${term}%`
      )
    }
  }

  switch (sort) {
    case "price-asc":
      query = query.order("price", { ascending: true, nullsFirst: false })
      break
    case "price-desc":
      query = query.order("price", { ascending: false, nullsFirst: false })
      break
    case "rating":
      query = query.order("rating", { ascending: false, nullsFirst: false })
      break
    case "year":
      query = query.order("year", { ascending: false, nullsFirst: false })
      break
    default:
      query = query
        .order("sort_score", { ascending: false })
        .order("rating", { ascending: false, nullsFirst: false })
      break
  }

  const { data, error, count } = await query

  if (error) throw error

  return {
    items: (data || []).map((row) => mapRow(row as FragranceRow)),
    total: count || 0,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil((count || 0) / perPage)),
  }
}

export async function getFragranceBySlug(slug: string) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("fragrances")
    .select(BASE_SELECT)
    .eq("slug", slug)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return mapRow(data as FragranceRow)
}

export async function getRelatedFragrances(fragrance: Fragrance, limit = 4) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("fragrances")
    .select(BASE_SELECT)
    .eq("primary_family", fragrance.family)
    .neq("slug", fragrance.slug)
    .order("rating", { ascending: false, nullsFirst: false })
    .limit(limit)

  if (error) throw error

  return (data || []).map((row) => mapRow(row as FragranceRow))
}

export async function getCatalogHighlights() {
  const supabase = getSupabaseAdmin()
  const [topRatedRes, recentRes, brandsRes, statsRes] = await Promise.all([
    supabase
      .from("fragrances")
      .select(BASE_SELECT)
      .order("rating", { ascending: false, nullsFirst: false })
      .limit(3),
    supabase
      .from("fragrances")
      .select(BASE_SELECT)
      .order("year", { ascending: false, nullsFirst: false })
      .limit(3),
    supabase
      .from("fragrances")
      .select("brand")
      .order("brand", { ascending: true })
      .limit(200),
    supabase.from("fragrances").select("brand,rating", { count: "exact" }),
  ])

  if (topRatedRes.error) throw topRatedRes.error
  if (recentRes.error) throw recentRes.error
  if (brandsRes.error) throw brandsRes.error
  if (statsRes.error) throw statsRes.error

  const brands = Array.from(
    new Set((brandsRes.data || []).map((item) => item.brand).filter(Boolean))
  ).slice(0, 8)

  const ratings = (statsRes.data || [])
    .map((item) => item.rating)
    .filter((item): item is number => typeof item === "number")

  return {
    topRated: (topRatedRes.data || []).map((row) => mapRow(row as FragranceRow)),
    recent: (recentRes.data || []).map((row) => mapRow(row as FragranceRow)),
    brands,
    stats: {
      total: statsRes.count || 0,
      averageRating: ratings.length
        ? Number((ratings.reduce((sum, item) => sum + item, 0) / ratings.length).toFixed(2))
        : 0,
    },
  }
}

export const FAMILY_OPTIONS = ["all", "floral", "woody", "amber", "fresh"] as const
