import { NextRequest, NextResponse } from "next/server"

import { getSupabaseAdmin } from "@/lib/supabase-admin"

type SearchFilterKey = "brand" | "family"

type QueryFilter = {
  key: SearchFilterKey
  value: string
}

type SearchRow = {
  fragella_id: string
  slug: string
  name: string
  brand: string
  primary_family: string | null
  price: number | null
  image_url: string | null
  image_url_transparent: string | null
  image_fallbacks: unknown
  oil_type: string | null
  longevity: string | null
  sillage: string | null
  gender: string | null
  country: string | null
}

const FILTER_PATTERN = /\b(brand|family):(?:"([^"]+)"|(\S+))/gi

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim()
}

function parseSearchQuery(query: string) {
  const filters: QueryFilter[] = []

  const text = query
    .replace(FILTER_PATTERN, (_, rawKey: string, quotedValue: string, bareValue: string) => {
      const key = rawKey.toLowerCase() as SearchFilterKey
      const value = (quotedValue || bareValue || "").trim()
      if (value) {
        filters.push({ key, value })
      }
      return " "
    })
    .replace(/\s+/g, " ")
    .trim()

  return { text, filters }
}

function levenshtein(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0))

  for (let i = 0; i <= a.length; i += 1) dp[i][0] = i
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    }
  }

  return dp[a.length][b.length]
}

function subsequenceScore(query: string, text: string) {
  let q = 0
  let matches = 0

  for (let i = 0; i < text.length && q < query.length; i += 1) {
    if (text[i] === query[q]) {
      matches += 1
      q += 1
    }
  }

  return matches === query.length ? matches * 2 : 0
}

function scoreToken(token: string, words: string[]) {
  let score = 0

  for (const word of words) {
    if (word === token) score = Math.max(score, 36)
    else if (word.startsWith(token)) score = Math.max(score, 28)
    else if (word.includes(token)) score = Math.max(score, 18)
    else if (token.length >= 4) {
      const distance = levenshtein(token, word)
      if (distance <= 1) score = Math.max(score, 16)
      else if (distance === 2) score = Math.max(score, 10)
    }
  }

  return score
}

function matchesFilter(rowValue: string | null, filterValue: string) {
  const normalizedRowValue = normalize(rowValue || "")
  const normalizedFilterValue = normalize(filterValue)
  if (!normalizedRowValue || !normalizedFilterValue) return false

  return (
    normalizedRowValue === normalizedFilterValue ||
    normalizedRowValue.startsWith(normalizedFilterValue) ||
    normalizedRowValue.includes(normalizedFilterValue)
  )
}

function rowMatchesFilters(row: SearchRow, filters: QueryFilter[]) {
  return filters.every((filter) => {
    if (filter.key === "brand") return matchesFilter(row.brand, filter.value)
    return matchesFilter(row.primary_family, filter.value)
  })
}

function scoreFilters(row: SearchRow, filters: QueryFilter[]) {
  let score = 0

  for (const filter of filters) {
    const candidate = filter.key === "brand" ? row.brand : row.primary_family || ""
    const normalizedCandidate = normalize(candidate)
    const normalizedValue = normalize(filter.value)

    if (normalizedCandidate === normalizedValue) score += 70
    else if (normalizedCandidate.startsWith(normalizedValue)) score += 48
    else if (normalizedCandidate.includes(normalizedValue)) score += 34
  }

  return score
}

function scoreRow(textQuery: string, filters: QueryFilter[], row: SearchRow) {
  if (!rowMatchesFilters(row, filters)) return 0

  const normalizedQuery = normalize(textQuery)
  const filterScore = scoreFilters(row, filters)
  if (!normalizedQuery) return Math.max(filterScore, filters.length * 24)

  const tokens = normalizedQuery.split(" ").filter(Boolean)
  const fields = [
    row.name,
    row.brand,
    row.primary_family || "",
    row.oil_type || "",
    row.longevity || "",
    row.sillage || "",
    row.gender || "",
    row.country || "",
  ]

  const normalizedFields = fields.map(normalize).filter(Boolean)
  const allWords = normalizedFields.flatMap((field) => field.split(" ").filter(Boolean))
  const joined = normalizedFields.join(" ")

  let score = 0

  if (normalize(row.name) === normalizedQuery) score += 140
  if (normalize(row.brand) === normalizedQuery) score += 120
  if (normalize(row.name).startsWith(normalizedQuery)) score += 80
  if (normalize(row.brand).startsWith(normalizedQuery)) score += 70
  if (joined.includes(normalizedQuery)) score += 50

  for (const token of tokens) {
    score += scoreToken(token, allWords)
  }

  score += subsequenceScore(normalizedQuery.replace(/\s+/g, ""), joined.replace(/\s+/g, ""))
  score += filterScore

  return score
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === "string")
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")?.trim() || ""
    const limit = Number(searchParams.get("limit") || "6")
    const parsedQuery = parseSearchQuery(query)

    if (!query || query.length < 2) {
      return NextResponse.json({ items: [], brands: [] })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("fragrances")
      .select(
        "fragella_id,slug,name,brand,primary_family,price,image_url,image_url_transparent,image_fallbacks,oil_type,longevity,sillage,gender,country,sort_score"
      )
      .order("sort_score", { ascending: false })
      .limit(250)

    if (error) throw error

    const scored = ((data || []) as SearchRow[])
      .map((row) => ({
        row,
        score: scoreRow(parsedQuery.text, parsedQuery.filters, row),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.row.brand.localeCompare(b.row.brand) || a.row.name.localeCompare(b.row.name))

    const matchedRows = scored.slice(0, Math.min(24, Math.max(limit * 3, 12))).map((item) => item.row)
    const items = matchedRows.slice(0, Math.min(8, Math.max(1, limit))).map((item) => ({
      id: item.fragella_id,
      slug: item.slug,
      name: item.name,
      brand: item.brand,
      family: item.primary_family || "other",
      price: item.price,
      imageUrl: item.image_url_transparent || item.image_url || toStringArray(item.image_fallbacks)[0] || null,
    }))

    const brandMap = new Map<string, { brand: string; count: number; family: string }>()
    for (const item of matchedRows) {
      const current = brandMap.get(item.brand)
      if (current) {
        current.count += 1
      } else {
        brandMap.set(item.brand, {
          brand: item.brand,
          count: 1,
          family: item.primary_family || "other",
        })
      }
    }

    const brands = Array.from(brandMap.values())
      .sort((a, b) => b.count - a.count || a.brand.localeCompare(b.brand))
      .slice(0, 5)

    return NextResponse.json({
      items,
      brands,
      appliedFilters: parsedQuery.filters,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ items: [], brands: [], error: message }, { status: 500 })
  }
}
