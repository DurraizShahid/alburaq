import fs from "node:fs"
import path from "node:path"
import process from "node:process"

import { createClient } from "@supabase/supabase-js"
import ws from "ws"

globalThis.WebSocket ??= ws

const ENV_PATH = path.resolve(process.cwd(), ".env.local")

function loadEnvFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8")

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue

    const separator = trimmed.indexOf("=")
    if (separator === -1) continue

    const key = trimmed.slice(0, separator)
    const value = trimmed.slice(separator + 1)
    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

loadEnvFile(ENV_PATH)

const FRAGELLA_API_KEY = process.env.FRAGELLA_API_KEY
const FRAGELLA_API_BASE_URL = process.env.FRAGELLA_API_BASE_URL
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY

if (!FRAGELLA_API_KEY || !FRAGELLA_API_BASE_URL || !SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  throw new Error("Missing required environment variables for Fragella import.")
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const BRAND_SEEDS = [
  "Dior",
  "Chanel",
  "Creed",
  "Tom Ford",
  "Maison Francis Kurkdjian",
  "Xerjoff",
  "Amouage",
  "Parfums de Marly",
  "Initio",
  "Mancera",
  "Montale",
  "Byredo",
  "Le Labo",
  "Diptyque",
  "Jo Malone London",
  "Frederic Malle",
  "Kilian",
  "Guerlain",
  "Yves Saint Laurent",
  "Givenchy",
  "Prada",
  "Giorgio Armani",
  "Versace",
  "Dolce & Gabbana",
  "Burberry",
  "Hermes",
  "Mugler",
  "Maison Margiela",
  "Acqua di Parma",
  "Cartier",
  "Memo Paris",
  "Serge Lutens",
  "Penhaligon's",
  "BDK Parfums",
  "Nishane",
  "Tiziana Terenzi",
  "Roja Dove",
  "Juliette Has A Gun",
  "Aesop",
  "Nasomatto",
  "Orto Parisi",
  "Escentric Molecules",
  "Lattafa",
  "Afnan",
  "Armaf",
  "Bond No 9",
  "Clive Christian",
  "M. Micallef",
  "Carolina Herrera",
  "Valentino",
  "Bvlgari",
  "Jean Paul Gaultier",
  "Davidoff",
  "Ralph Lauren",
  "Elie Saab",
  "Lancome",
  "Narciso Rodriguez",
  "Kayali",
  "Commodity",
  "The House of Oud",
]

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function parseNumber(value) {
  if (value === null || value === undefined || value === "") return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

function familyFromAccords(accords = []) {
  const normalized = accords.map((item) => String(item).toLowerCase())

  const checks = [
    { family: "floral", keys: ["floral", "white floral", "rose", "yellow floral", "tuberose"] },
    { family: "woody", keys: ["woody", "earthy", "mossy", "leather", "smoky"] },
    { family: "amber", keys: ["amber", "vanilla", "warm spicy", "balsamic", "gourmand", "sweet"] },
    { family: "fresh", keys: ["citrus", "aromatic", "green", "aquatic", "fresh spicy", "fruity"] },
  ]

  for (const check of checks) {
    if (normalized.some((accord) => check.keys.includes(accord))) {
      return check.family
    }
  }

  return "fresh"
}

function popularityWeight(value) {
  const normalized = String(value || "").toLowerCase()
  if (normalized.includes("very high")) return 5
  if (normalized.includes("high")) return 4
  if (normalized.includes("medium")) return 3
  if (normalized.includes("low")) return 2
  return 1
}

function normalizeRow(item, sourceBrand) {
  const rating = parseNumber(item.rating)
  const price = parseNumber(item.Price)
  const accords = Array.isArray(item["Main Accords"]) ? item["Main Accords"] : []
  const score = (rating || 0) * 20 + popularityWeight(item.Popularity) * 5

  return {
    fragella_id: item._id,
    slug: slugify(`${item.Brand || sourceBrand}-${item.Name || item._id}`),
    name: item.Name,
    brand: item.Brand || sourceBrand,
    primary_family: familyFromAccords(accords),
    year: parseNumber(item.Year),
    rating,
    country: item.Country || null,
    price,
    gender: item.Gender || null,
    oil_type: item.OilType || null,
    longevity: item.Longevity || null,
    sillage: item.Sillage || null,
    confidence: item.Confidence || null,
    popularity: item.Popularity || null,
    price_value: item["Price Value"] || null,
    image_url: item["Image URL"] || null,
    image_url_transparent: item["Image URL Transparent"] || null,
    image_fallbacks: Array.isArray(item["Image Fallbacks"]) ? item["Image Fallbacks"] : [],
    purchase_url: item["Purchase URL"] || null,
    general_notes: Array.isArray(item["General Notes"]) ? item["General Notes"] : [],
    main_accords: accords,
    main_accords_percentage:
      item["Main Accords Percentage"] && typeof item["Main Accords Percentage"] === "object"
        ? item["Main Accords Percentage"]
        : {},
    season_ranking: Array.isArray(item["Season Ranking"]) ? item["Season Ranking"] : [],
    occasion_ranking: Array.isArray(item["Occasion Ranking"]) ? item["Occasion Ranking"] : [],
    notes: item.Notes && typeof item.Notes === "object" ? item.Notes : {},
    source_brand: sourceBrand,
    sort_score: score,
    source_payload: item,
  }
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "x-api-key": FRAGELLA_API_KEY,
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Fragella request failed ${response.status}: ${text}`)
  }

  return response.json()
}

async function fetchUsage() {
  return fetchJson(`${FRAGELLA_API_BASE_URL}/usage`)
}

async function fetchBrand(brand) {
  const url = `${FRAGELLA_API_BASE_URL}/brands/${encodeURIComponent(brand)}`
  return fetchJson(url)
}

async function upsertChunk(rows) {
  const { error } = await supabase.from("fragrances").upsert(rows, {
    onConflict: "fragella_id",
  })

  if (error) {
    throw new Error(error.message)
  }
}

async function main() {
  console.log("Checking Fragella usage...")
  const usage = await fetchUsage()
  console.log(
    JSON.stringify(
      {
        plan: usage.plan,
        requestsRemaining: usage?.usage?.requests_remaining,
      },
      null,
      2
    )
  )

  let totalImported = 0

  for (const brand of BRAND_SEEDS) {
    try {
      console.log(`Fetching ${brand}...`)
      const raw = await fetchBrand(brand)
      const items = Array.isArray(raw) ? raw : []
      const rows = items
        .filter((item) => item && item._id && item.Name)
        .map((item) => normalizeRow(item, brand))

      for (let index = 0; index < rows.length; index += 100) {
        const chunk = rows.slice(index, index + 100)
        if (chunk.length > 0) {
          await upsertChunk(chunk)
          totalImported += chunk.length
        }
      }

      console.log(`Imported ${rows.length} rows for ${brand}. Running total: ${totalImported}`)
      await sleep(250)
    } catch (error) {
      console.error(`Failed for ${brand}:`, error instanceof Error ? error.message : error)
      await sleep(500)
    }
  }

  console.log(`Done. Imported/upserted ${totalImported} fragrances.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
