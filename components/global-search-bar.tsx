"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Clock3, CornerDownLeft, Menu, Search, ShoppingBag, Sparkles, X } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { useCart } from "@/components/cart-provider"
import ShinyText from "@/components/ShinyText"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useHasMounted } from "@/hooks/use-has-mounted"
import { useIsMobile } from "@/hooks/use-mobile"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { formatPrice } from "@/lib/fragrances"

type SearchResult = {
  id: string
  slug: string
  name: string
  brand: string
  family: string
  price: number | null
  imageUrl: string | null
}

type SearchBrand = {
  brand: string
  count: number
  family: string
}

type SearchFilterKey = "brand" | "family"

type QueryFilter = {
  key: SearchFilterKey
  value: string
}

type ParsedSearchQuery = {
  plainText: string
  filters: QueryFilter[]
}

type SelectableEntry =
  | { kind: "result"; slug: string }
  | { kind: "brand"; value: string }
  | { kind: "submit"; query: string }
  | { kind: "recent"; value: string }

type SearchResultsPanelProps = {
  query: string
  highlightQuery: string
  activeFilters: QueryFilter[]
  results: SearchResult[]
  brands: SearchBrand[]
  recentSearches: string[]
  clearRecents: () => void
  isLoading: boolean
  selectableIndexMap: Map<string, number>
  activeIndex: number
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>
  activateEntry: (entry: SelectableEntry) => void
  setItemRef: (key: string, element: HTMLButtonElement | null) => void
  panelMode: "dropdown" | "dialog"
}

const RECENT_SEARCHES_KEY = "alburaq-recent-searches"
const FILTER_PATTERN = /\b(brand|family):(?:"([^"]+)"|(\S+))/gi
const primaryNavLinks = [
  { href: "/", label: "Home" },
  { href: "/perfumes", label: "Shop" },
  { href: "/support", label: "Support" },
  { href: "/contact", label: "Contact" },
] as const

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function parseSearchQuery(query: string): ParsedSearchQuery {
  const filters: QueryFilter[] = []

  const plainText = query
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

  return { plainText, filters }
}

function formatFilterToken(filter: QueryFilter) {
  return /\s/.test(filter.value) ? `${filter.key}:"${filter.value}"` : `${filter.key}:${filter.value}`
}

function buildSearchQuery(filters: QueryFilter[], plainText: string) {
  return [...filters.map(formatFilterToken), plainText.trim()].filter(Boolean).join(" ").trim()
}

function renderHighlightedText(text: string, query: string) {
  const tokens = query
    .trim()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)

  if (!text || tokens.length === 0) return text

  const pattern = new RegExp(`(${tokens.map(escapeRegExp).join("|")})`, "ig")
  const parts = text.split(pattern)

  return parts.map((part, index) =>
    tokens.some((token) => part.toLowerCase() === token.toLowerCase()) ? (
      <mark
        key={`${part}-${index}`}
        className="rounded-sm bg-luxury-mark/80 px-0.5 text-inherit dark:bg-primary/25"
      >
        {part}
      </mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    )
  )
}

function getResultInitials(result: SearchResult) {
  const source = `${result.brand} ${result.name}`.trim()
  const tokens = source.split(/\s+/).filter(Boolean)
  return tokens
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase() || "")
    .join("")
}

function getEntryKey(entry: SelectableEntry) {
  switch (entry.kind) {
    case "result":
      return `result:${entry.slug}`
    case "brand":
      return `brand:${entry.value}`
    case "submit":
      return `submit:${entry.query}`
    case "recent":
      return `recent:${entry.value}`
  }
}

function getActiveClasses(isActive: boolean) {
  return isActive
    ? "luxury-active-soft ring-1 ring-primary/18 shadow-[0_8px_22px_rgba(87,72,49,0.10)] scale-[1.01] dark:bg-muted/50 dark:ring-border"
    : "luxury-hover-soft dark:bg-muted/30 dark:hover:bg-muted/40"
}

function keepInputFocus(event: React.MouseEvent<HTMLButtonElement>) {
  event.preventDefault()
}

function SearchLoadingRows() {
  return (
    <div className="grid gap-2 px-2 py-1">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`search-loading-${index}`}
          className="flex items-center gap-4 rounded-[1.2rem] px-3 py-3"
        >
          <Skeleton className="h-16 w-16 shrink-0 rounded-[1rem]" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/5 rounded-full" />
            <Skeleton className="h-3 w-3/5 rounded-full" />
          </div>
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
      ))}
    </div>
  )
}

function SearchAssistRow({
  activeFilters,
  onRemoveFilter,
  onInsertFilterPrefix,
  showPrimaryNav = false,
}: {
  activeFilters: QueryFilter[]
  onRemoveFilter: (filterIndex: number) => void
  onInsertFilterPrefix: (key: SearchFilterKey) => void
  showPrimaryNav?: boolean
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-4">
      {activeFilters.map((filter, index) => (
        <button
          key={`${filter.key}-${filter.value}-${index}`}
          type="button"
          onClick={() => onRemoveFilter(index)}
          className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-luxury-ink transition-colors hover:border-primary/30 hover:bg-luxury-soft dark:bg-muted/30 dark:text-foreground"
        >
          <span>{filter.key}</span>
          <span className="normal-case tracking-normal text-muted-foreground">{filter.value}</span>
          <X className="size-3" />
        </button>
      ))}

      <button
        type="button"
        onClick={() => onInsertFilterPrefix("brand")}
        className="inline-flex items-center gap-2 rounded-full border border-dashed border-border/60 bg-background/70 px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-primary/30 hover:text-luxury-ink dark:bg-muted/20 dark:hover:text-foreground"
      >
        <Sparkles className="size-3.5" />
        brand:
      </button>

      <button
        type="button"
        onClick={() => onInsertFilterPrefix("family")}
        className="inline-flex items-center gap-2 rounded-full border border-dashed border-border/60 bg-background/70 px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-primary/30 hover:text-luxury-ink dark:bg-muted/20 dark:hover:text-foreground"
      >
        <Sparkles className="size-3.5" />
        family:
      </button>

      {showPrimaryNav ? (
        <div className="hidden flex-wrap items-center gap-2 md:ml-auto md:flex">
          {primaryNavLinks.map((link) => (
            <Button key={link.href} type="button" variant="ghost" size="sm" asChild>
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function SearchResultsPanel({
  query,
  highlightQuery,
  activeFilters,
  results,
  brands,
  recentSearches,
  clearRecents,
  isLoading,
  selectableIndexMap,
  activeIndex,
  setActiveIndex,
  activateEntry,
  setItemRef,
  panelMode,
}: SearchResultsPanelProps) {
  const hasSearchTerm = query.trim().length >= 2
  const hasInstantMatches = brands.length > 0 || results.length > 0
  const maxHeightClass =
    panelMode === "dialog"
      ? "max-h-[min(50vh,26rem)] sm:max-h-[min(58vh,32rem)] lg:max-h-[min(60vh,34rem)]"
      : "max-h-[min(70vh,30rem)]"

  return (
    <div className="flex min-h-0 flex-col gap-2">
      {hasSearchTerm ? (
        <div className="luxury-meta px-3 pb-2 pt-2 text-[11px] uppercase tracking-[0.2em]">
          {isLoading ? "Searching..." : `Results for ${query.trim()}`}
        </div>
      ) : (
        <div className="luxury-meta px-3 pb-2 pt-2 text-[11px] uppercase tracking-[0.2em]">
          Recent searches and quick filters
        </div>
      )}

      {activeFilters.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 px-3 pb-1">
          {activeFilters.map((filter, index) => (
            <Badge key={`${filter.key}-${filter.value}-${index}`} variant="secondary" className="rounded-full">
              {filter.key}:{filter.value}
            </Badge>
          ))}
        </div>
      ) : null}

      <div
        data-lenis-prevent
        data-lenis-prevent-wheel
        data-lenis-prevent-touch
        className={`min-h-0 ${maxHeightClass} overflow-y-auto overscroll-contain pr-1 touch-pan-y`}
      >
        <div className="grid gap-2">
          {isLoading ? <SearchLoadingRows /> : null}

          {!isLoading && brands.length > 0 ? (
            <div className="grid gap-2">
              <div className="flex items-center justify-between px-3 pt-1">
                <div className="luxury-meta text-[11px] uppercase tracking-[0.2em]">Brands</div>
                <Badge variant="secondary" className="rounded-full">
                  {brands.length} suggestion{brands.length > 1 ? "s" : ""}
                </Badge>
              </div>

              {brands.map((item) => {
                const itemIndex = selectableIndexMap.get(`brand:${item.brand}`) ?? -1
                const isActive = activeIndex === itemIndex

                return (
                  <button
                    key={item.brand}
                    ref={(element) => setItemRef(`brand:${item.brand}`, element)}
                    type="button"
                    onMouseDown={keepInputFocus}
                    onMouseEnter={() => setActiveIndex(itemIndex)}
                    onClick={() => activateEntry({ kind: "brand", value: item.brand })}
                    className={`flex items-center justify-between gap-4 rounded-[1.2rem] px-3 py-3 sm:px-4 text-left transition-all duration-200 ease-out ${getActiveClasses(
                      isActive
                    )}`}
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-luxury-ink dark:text-foreground">
                        {renderHighlightedText(item.brand, highlightQuery)}
                      </div>
                      <div className="luxury-meta mt-1 text-xs">
                        House spotlight in {renderHighlightedText(item.family, highlightQuery)}
                      </div>
                    </div>
                    <Badge variant="secondary" className="rounded-full">
                      {item.count} match{item.count > 1 ? "es" : ""}
                    </Badge>
                  </button>
                )
              })}
            </div>
          ) : null}

          {!isLoading && results.length > 0 ? (
            <div className="grid gap-2">
              <div className="flex items-center justify-between px-3 pt-1">
                <div className="luxury-meta text-[11px] uppercase tracking-[0.2em]">Fragrances</div>
                <Badge variant="secondary" className="rounded-full">
                  {results.length} result{results.length > 1 ? "s" : ""}
                </Badge>
              </div>

              {results.map((item) => {
                const itemIndex = selectableIndexMap.get(`result:${item.slug}`) ?? -1
                const isActive = activeIndex === itemIndex

                return (
                  <button
                    key={item.id}
                    ref={(element) => setItemRef(`result:${item.slug}`, element)}
                    type="button"
                    onMouseDown={keepInputFocus}
                    onMouseEnter={() => setActiveIndex(itemIndex)}
                    onClick={() => activateEntry({ kind: "result", slug: item.slug })}
                    className={`flex items-center gap-3 rounded-[1.2rem] px-3 py-3 text-left transition-all duration-200 ease-out sm:gap-4 ${getActiveClasses(
                      isActive
                    )}`}
                  >
                    <div className="luxury-canvas relative h-16 w-16 shrink-0 overflow-hidden rounded-[1rem] dark:bg-background/40">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          unoptimized
                          sizes="64px"
                          className="object-contain p-2"
                        />
                      ) : (
                        <div className="luxury-copy flex h-full items-center justify-center text-sm font-medium tracking-[0.18em] dark:text-muted-foreground">
                          {getResultInitials(item)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-luxury-ink dark:text-foreground">
                        {renderHighlightedText(item.name, highlightQuery)}
                      </div>
                      <div className="luxury-meta mt-1 flex flex-wrap items-center gap-2 text-xs">
                        <span>{renderHighlightedText(item.brand, highlightQuery)}</span>
                        <span>·</span>
                        <span>{renderHighlightedText(item.family, highlightQuery)}</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-sm font-medium text-luxury-ink dark:text-foreground">
                      {formatPrice(item.price)}
                    </div>
                  </button>
                )
              })}
            </div>
          ) : null}

          {!isLoading && hasSearchTerm ? (
            <Button
              ref={(element) => setItemRef(`submit:${query.trim()}`, element)}
              type="button"
              variant="ghost"
              onMouseDown={keepInputFocus}
              onMouseEnter={() => setActiveIndex(selectableIndexMap.get(`submit:${query.trim()}`) ?? -1)}
              onClick={() => activateEntry({ kind: "submit", query: query.trim() })}
              className={`justify-between rounded-[1.15rem] px-4 py-6 text-luxury-ink transition-all duration-200 ease-out dark:text-foreground ${getActiveClasses(
                activeIndex === (selectableIndexMap.get(`submit:${query.trim()}`) ?? -1)
              )}`}
            >
              <span>See all matching fragrances</span>
              <CornerDownLeft className="size-4" />
            </Button>
          ) : null}

          {!isLoading && hasSearchTerm && !hasInstantMatches ? (
            <div className="luxury-panel luxury-copy rounded-[1.2rem] px-4 py-5 text-sm dark:bg-muted/30 dark:text-muted-foreground">
              No instant matches. Press Enter to search the full catalog.
            </div>
          ) : null}

          {recentSearches.length > 0 ? (
            <div className="px-1 pb-1 pt-3">
              <div className="flex items-center justify-between px-3 pb-2">
                <div className="luxury-meta text-[11px] uppercase tracking-[0.2em]">
                  Recent searches
                </div>
                <button
                  type="button"
                  onMouseDown={keepInputFocus}
                  onClick={clearRecents}
                  className="luxury-meta inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] uppercase tracking-[0.16em] transition-colors hover:bg-luxury-panel hover:text-luxury-ink dark:hover:bg-muted/30 dark:hover:text-foreground"
                >
                  <X className="size-3" />
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2 px-2">
                {recentSearches.map((item) => {
                  const itemIndex = selectableIndexMap.get(`recent:${item}`) ?? -1

                  return (
                    <button
                      key={item}
                      ref={(element) => setItemRef(`recent:${item}`, element)}
                      type="button"
                      onMouseDown={keepInputFocus}
                      onMouseEnter={() => setActiveIndex(itemIndex)}
                      onClick={() => activateEntry({ kind: "recent", value: item })}
                      className={`inline-flex items-center gap-2 rounded-[1rem] px-3 py-2 text-sm transition-all duration-200 ease-out ${
                        activeIndex === itemIndex
                          ? "luxury-active-soft ring-1 ring-primary/18 shadow-[0_8px_22px_rgba(87,72,49,0.10)] scale-[1.01] dark:bg-muted/50 dark:text-foreground dark:ring-border"
                          : "luxury-hover-soft dark:bg-muted/30 dark:text-foreground dark:hover:bg-muted/40"
                      }`}
                    >
                      <Clock3 className="size-3.5" />
                      {renderHighlightedText(item, highlightQuery)}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-3 pb-2 pt-3">
        <Badge variant="secondary" className="rounded-full">
          {panelMode === "dialog" ? "Palette" : "Sticky"}
        </Badge>
        <Badge variant="secondary" className="rounded-full">
          Instant preview
        </Badge>
        <Badge variant="secondary" className="rounded-full">
          Fuzzy match
        </Badge>
        <Badge variant="secondary" className="rounded-full">
          Chip filters
        </Badge>
      </div>
    </div>
  )
}

export function GlobalSearchBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const defaultQuery = useMemo(() => searchParams.get("q") || "", [searchParams])
  return <GlobalSearchBarInner key={`${pathname}:${defaultQuery}`} defaultQuery={defaultQuery} />
}

function GlobalSearchBarInner({ defaultQuery }: { defaultQuery: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const { itemCount, openCart, hasHydrated } = useCart()
  const hasMounted = useHasMounted()
  const isMobile = useIsMobile()
  const headerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const paletteInputRef = useRef<HTMLInputElement>(null)
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [query, setQuery] = useState(defaultQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [brands, setBrands] = useState<SearchBrand[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const saved = window.localStorage.getItem(RECENT_SEARCHES_KEY)
      const parsed = saved ? (JSON.parse(saved) as unknown) : []
      if (!Array.isArray(parsed)) return []
      return parsed.filter((item): item is string => typeof item === "string").slice(0, 5)
    } catch {
      return []
    }
  })
  const [isOpen, setIsOpen] = useState(false)
  const [isPaletteOpen, setIsPaletteOpen] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const parsedQuery = useMemo(() => parseSearchQuery(query), [query])
  const highlightQuery = useMemo(
    () => [parsedQuery.plainText, ...parsedQuery.filters.map((filter) => filter.value)].join(" ").trim(),
    [parsedQuery]
  )

  const focusActiveInput = useCallback(() => {
    const target = isPaletteOpen ? paletteInputRef.current : inputRef.current
    window.requestAnimationFrame(() => {
      target?.focus()
      target?.setSelectionRange(target.value.length, target.value.length)
    })
  }, [isPaletteOpen])

  const closeSearchSurfaces = useCallback(() => {
    setIsOpen(false)
    setIsPaletteOpen(false)
    setActiveIndex(-1)
  }, [])

  const openPalette = useCallback(() => {
    setIsMobileNavOpen(false)
    setIsOpen(false)
    setIsPaletteOpen(true)
    setActiveIndex(-1)
  }, [])

  const openCartPanel = useCallback(() => {
    setIsMobileNavOpen(false)
    closeSearchSurfaces()
    openCart()
  }, [closeSearchSurfaces, openCart])

  const saveRecent = useCallback((value: string) => {
    if (typeof window === "undefined") return
    const term = value.trim()
    if (!term) return

    setRecentSearches((current) => {
      const next = [term, ...current.filter((item) => item.toLowerCase() !== term.toLowerCase())].slice(0, 5)
      window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const clearRecents = useCallback(() => {
    if (typeof window === "undefined") return
    window.localStorage.removeItem(RECENT_SEARCHES_KEY)
    setRecentSearches([])
  }, [])

  const submitSearch = useCallback(
    (value: string) => {
      const term = value.trim()
      if (!term) return
      saveRecent(term)
      closeSearchSurfaces()
      router.push(`/perfumes?q=${encodeURIComponent(term)}`)
    },
    [closeSearchSurfaces, router, saveRecent]
  )

  const insertFilterPrefix = useCallback(
    (key: SearchFilterKey) => {
      const prefix = `${key}:`
      const nextQuery = query.trim() ? `${query.trim()} ${prefix}` : prefix
      setQuery(nextQuery)
      setIsOpen(true)
      setActiveIndex(-1)
      focusActiveInput()
    },
    [focusActiveInput, query]
  )

  const removeFilter = useCallback(
    (filterIndex: number) => {
      const nextFilters = parsedQuery.filters.filter((_, index) => index !== filterIndex)
      setQuery(buildSearchQuery(nextFilters, parsedQuery.plainText))
      setActiveIndex(-1)
      focusActiveInput()
    },
    [focusActiveInput, parsedQuery]
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const tagName = target?.tagName
      const isTypingTarget = tagName === "INPUT" || tagName === "TEXTAREA" || target?.isContentEditable

      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setIsOpen(false)
        setIsPaletteOpen(true)
        setActiveIndex(-1)
        return
      }

      if (event.key === "/" && !isTypingTarget) {
        event.preventDefault()
        setIsPaletteOpen(false)
        setIsOpen(true)
        setActiveIndex(-1)
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    if (!isPaletteOpen) return

    window.requestAnimationFrame(() => {
      paletteInputRef.current?.focus()
      paletteInputRef.current?.select()
    })
  }, [isPaletteOpen])

  useEffect(() => {
    const header = headerRef.current
    if (!header) return

    const updateHeaderHeight = () => {
      document.documentElement.style.setProperty("--global-search-bar-height", `${header.offsetHeight}px`)
    }

    updateHeaderHeight()

    const observer = new ResizeObserver(() => updateHeaderHeight())
    observer.observe(header)
    window.addEventListener("resize", updateHeaderHeight)

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", updateHeaderHeight)
      document.documentElement.style.removeProperty("--global-search-bar-height")
    }
  }, [])

  const updateQueryValue = useCallback((nextValue: string) => {
    setQuery(nextValue)
    if (nextValue.trim().length < 2) {
      setResults([])
      setBrands([])
      setIsLoading(false)
    }
    setActiveIndex(-1)
  }, [])

  const setItemRef = useCallback((key: string, element: HTMLButtonElement | null) => {
    itemRefs.current[key] = element
  }, [])

  useEffect(() => {
    const term = query.trim()
    if (term.length < 2) return

    const controller = new AbortController()
    const timeout = window.setTimeout(async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/search?q=${encodeURIComponent(term)}&limit=6`, {
          signal: controller.signal,
        })
        const data = (await response.json()) as {
          items?: SearchResult[]
          brands?: SearchBrand[]
        }
        setResults(Array.isArray(data.items) ? data.items : [])
        setBrands(Array.isArray(data.brands) ? data.brands : [])
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setResults([])
          setBrands([])
        }
      } finally {
        setIsLoading(false)
      }
    }, 180)

    return () => {
      controller.abort()
      window.clearTimeout(timeout)
    }
  }, [query])

  const selectableEntries = useMemo<SelectableEntry[]>(() => {
    const entries: SelectableEntry[] = []

    for (const item of brands) {
      entries.push({ kind: "brand", value: item.brand })
    }

    for (const item of results) {
      entries.push({ kind: "result", slug: item.slug })
    }

    if (query.trim().length >= 2) {
      entries.push({ kind: "submit", query: query.trim() })
    }

    for (const item of recentSearches) {
      entries.push({ kind: "recent", value: item })
    }

    return entries
  }, [brands, query, recentSearches, results])

  const selectableIndexMap = useMemo(() => {
    const nextMap = new Map<string, number>()
    selectableEntries.forEach((entry, index) => {
      nextMap.set(getEntryKey(entry), index)
    })
    return nextMap
  }, [selectableEntries])

  const activateEntry = useCallback(
    (entry: SelectableEntry) => {
      if (entry.kind === "result") {
        const item = results.find((result) => result.slug === entry.slug)
        if (item) {
          saveRecent(item.name)
          closeSearchSurfaces()
          router.push(`/perfumes/${item.slug}`)
        }
        return
      }

      if (entry.kind === "brand") {
        submitSearch(formatFilterToken({ key: "brand", value: entry.value }))
        return
      }

      if (entry.kind === "recent") {
        setQuery(entry.value)
        submitSearch(entry.value)
        return
      }

      submitSearch(entry.query)
    },
    [closeSearchSurfaces, results, router, saveRecent, submitSearch]
  )

  const completeEntry = useCallback(
    (entry: SelectableEntry) => {
      if (entry.kind === "brand") {
        setQuery(formatFilterToken({ key: "brand", value: entry.value }))
        return
      }

      if (entry.kind === "recent") {
        setQuery(entry.value)
        return
      }

      if (entry.kind === "result") {
        const item = results.find((result) => result.slug === entry.slug)
        if (item) {
          setQuery(item.name)
        }
        return
      }

      setQuery(entry.query)
    },
    [results]
  )

  useEffect(() => {
    if (activeIndex < 0 || activeIndex >= selectableEntries.length) return

    const entry = selectableEntries[activeIndex]
    const element = itemRefs.current[getEntryKey(entry)]
    element?.scrollIntoView({ block: "nearest", inline: "nearest" })
  }, [activeIndex, selectableEntries])

  const handleInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>, showResults: boolean) => {
      if (event.key === "Escape") {
        event.preventDefault()
        if (isPaletteOpen) {
          setIsPaletteOpen(false)
        } else {
          setIsOpen(false)
        }
        return
      }

      if (!showResults) return

      if (event.key === "ArrowDown") {
        event.preventDefault()
        setActiveIndex((current) => (selectableEntries.length ? (current + 1) % selectableEntries.length : -1))
      }

      if (event.key === "ArrowUp") {
        event.preventDefault()
        setActiveIndex((current) =>
          selectableEntries.length ? (current <= 0 ? selectableEntries.length - 1 : current - 1) : -1
        )
      }

      if (event.key === "Tab") {
        const entry =
          activeIndex >= 0 && selectableEntries[activeIndex] ? selectableEntries[activeIndex] : selectableEntries[0]

        if (entry) {
          event.preventDefault()
          completeEntry(entry)
          focusActiveInput()
        }
      }

      if (event.key === "Enter" && activeIndex >= 0 && selectableEntries[activeIndex]) {
        event.preventDefault()
        activateEntry(selectableEntries[activeIndex])
      }
    },
    [activateEntry, activeIndex, completeEntry, focusActiveInput, isPaletteOpen, selectableEntries]
  )

  const showDropdown = !isPaletteOpen && isOpen && (query.trim().length >= 2 || recentSearches.length > 0)
  const showPaletteResults = query.trim().length >= 2 || recentSearches.length > 0

  return (
    <>
      <div
        aria-hidden="true"
        className="shrink-0"
        style={{ height: "var(--global-search-bar-height, 8rem)" }}
      />
      <div
        ref={headerRef}
        className="fixed inset-x-0 top-0 z-40 border-b border-border/50 bg-background/78 backdrop-blur-xl"
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-3 md:px-8 lg:px-12">
          <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              submitSearch(query)
            }}
            className="relative grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start lg:grid-cols-[auto_minmax(0,1fr)_auto_auto]"
          >
            <div className="flex items-start justify-between gap-3 self-center sm:col-span-2 lg:col-span-1">
              <div className="flex flex-col items-start justify-center gap-0">
                <Link href="/" className="inline-flex items-center self-start">
                  <Image
                    src="/logo-dark.png"
                    alt="Alburaq Atelier logo"
                    width={344}
                    height={94}
                    priority
                    className="h-auto w-[150px] md:w-[170px]"
                  />
                </Link>
                <ShinyText
                  text="Perfume as atmosphere."
                  speed={4}
                  className="ml-1 text-[9px] leading-none tracking-[0.24em] uppercase"
                  color="#8f7046"
                  shineColor="#f3dba7"
                />
              </div>

              <div className="flex items-center gap-2 md:hidden">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={openPalette}
                  className="h-11 w-11 rounded-full"
                >
                  <Search className="size-4" />
                  <span className="sr-only">Open search palette</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={openCartPanel}
                  className="relative h-11 w-11 rounded-full"
                >
                  <ShoppingBag className="size-4" />
                  <span className="sr-only">Open cart</span>
                  <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] leading-none text-primary-foreground">
                    {hasMounted && hasHydrated ? itemCount : 0}
                  </span>
                </Button>
                <SheetTrigger asChild>
                  <Button type="button" variant="outline" size="icon" className="h-11 w-11 rounded-full">
                    <Menu className="size-4" />
                    <span className="sr-only">Open navigation menu</span>
                  </Button>
                </SheetTrigger>
              </div>
            </div>

            <div className="luxury-panel relative min-w-0 overflow-hidden rounded-none bg-background/70 px-1 py-1 shadow-[0_10px_24px_rgba(75,55,28,0.08)] sm:col-span-2 lg:col-span-1 dark:bg-muted/30">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(event) => updateQueryValue(event.target.value)}
                onFocus={() => {
                  setIsPaletteOpen(false)
                  setIsOpen(true)
                  setActiveIndex(-1)
                }}
                onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
                onKeyDown={(event) => handleInputKeyDown(event, showDropdown)}
                placeholder='Search fragrances, brands, families, or try brand:"Dior"...'
                className="h-13 rounded-none border-0 bg-luxury-soft pl-11 pr-4 shadow-none lg:pr-28 dark:bg-background/40"
              />
              <div className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-2 lg:flex">
                <span className="luxury-kbd rounded-md px-2 py-1 text-[10px] uppercase tracking-[0.2em] dark:bg-background/50 dark:text-muted-foreground">
                  /
                </span>
                <span className="luxury-kbd rounded-md px-2 py-1 text-[10px] uppercase tracking-[0.2em] dark:bg-background/50 dark:text-muted-foreground">
                  Ctrl K
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={openPalette}
              className="hidden h-13 w-full rounded-none px-4 sm:w-auto sm:px-5 md:flex"
            >
              <span className="sm:hidden">Palette</span>
              <span className="hidden sm:inline">Open Palette</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={openCartPanel}
              className="hidden h-13 w-full rounded-none px-4 sm:w-auto sm:px-5 md:flex"
            >
              <ShoppingBag />
              <span className="sm:hidden">Cart</span>
              <span className="hidden sm:inline">Open Cart</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] leading-none text-primary">
                {hasMounted && hasHydrated ? itemCount : 0}
              </span>
            </Button>

            <SearchAssistRow
              activeFilters={parsedQuery.filters}
              onRemoveFilter={removeFilter}
              onInsertFilterPrefix={insertFilterPrefix}
              showPrimaryNav
            />

            {showDropdown ? (
              <Card
                data-lenis-prevent
                data-lenis-prevent-wheel
                data-lenis-prevent-touch
                className="luxury-shell-strong absolute left-0 right-0 top-[calc(100%+0.75rem)] z-50 overflow-hidden rounded-[1.6rem] p-2 dark:bg-card"
              >
                <SearchResultsPanel
                  query={query}
                  highlightQuery={highlightQuery}
                  activeFilters={parsedQuery.filters}
                  results={results}
                  brands={brands}
                  recentSearches={recentSearches}
                  clearRecents={clearRecents}
                  isLoading={isLoading}
                  selectableIndexMap={selectableIndexMap}
                  activeIndex={activeIndex}
                  setActiveIndex={setActiveIndex}
                  activateEntry={activateEntry}
                  setItemRef={setItemRef}
                  panelMode="dropdown"
                />
              </Card>
            ) : null}
          </form>
            <SheetContent
              side="left"
              className="w-[88vw] max-w-sm border-r border-border/60 bg-background p-0 md:hidden"
            >
              <SheetHeader className="border-b border-border/60 px-5 pt-5 pb-4 pr-14">
                <Link href="/" className="inline-flex w-fit items-center" onClick={() => setIsMobileNavOpen(false)}>
                  <Image
                    src="/logo-dark.png"
                    alt="Alburaq Atelier logo"
                    width={344}
                    height={94}
                    className="h-auto w-[140px]"
                  />
                </Link>
                <SheetTitle className="text-left">Browse Alburaq</SheetTitle>
                <SheetDescription className="text-left">
                  Shop collections, open the search palette, or jump straight to your cart.
                </SheetDescription>
              </SheetHeader>

              <div className="flex h-full flex-col gap-6 px-5 py-5">
                <nav className="grid gap-2">
                  {primaryNavLinks.map((link) => {
                    const isActive =
                      link.href === "/" ? pathname === link.href : pathname.startsWith(link.href)

                    return (
                      <SheetClose asChild key={link.href}>
                        <Link
                          href={link.href}
                          className={`rounded-[1rem] border px-4 py-3 text-sm font-medium transition-colors ${
                            isActive
                              ? "border-primary/30 bg-primary/10 text-luxury-ink dark:text-foreground"
                              : "border-border/60 bg-background/75 text-luxury-ink hover:bg-luxury-soft dark:bg-muted/20 dark:text-foreground dark:hover:bg-muted/40"
                          }`}
                        >
                          {link.label}
                        </Link>
                      </SheetClose>
                    )
                  })}
                </nav>

                <div className="grid gap-2 border-t border-border/60 pt-5">
                  <Button type="button" variant="outline" className="justify-start rounded-[1rem]" onClick={openPalette}>
                    <Search className="size-4" />
                    Open search palette
                  </Button>
                  <Button type="button" variant="outline" className="justify-start rounded-[1rem]" onClick={openCartPanel}>
                    <ShoppingBag className="size-4" />
                    Open cart
                    <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] leading-none text-primary">
                      {hasMounted && hasHydrated ? itemCount : 0}
                    </span>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <Dialog
        open={isPaletteOpen}
        onOpenChange={(open) => {
          setIsPaletteOpen(open)
          if (open) {
            setIsOpen(false)
            setActiveIndex(-1)
          }
        }}
      >
        <DialogContent
          className={`overflow-hidden border-0 bg-[#f5f2ec] p-0 text-foreground shadow-[0_32px_90px_rgba(57,49,37,0.22)] dark:bg-card ${
            isMobile
              ? "left-0 right-0 top-auto bottom-0 grid h-[min(92vh,48rem)] w-full max-w-none translate-x-0 translate-y-0 rounded-t-[1.75rem] rounded-b-none"
              : "left-1/2 top-[8vh] grid max-h-[84vh] w-[min(100%-2rem,68rem)] max-w-[68rem] translate-x-[-50%] translate-y-0 rounded-[2rem]"
          }`}
          showCloseButton
        >
          <div className="flex min-h-0 flex-col gap-4 p-4 sm:p-5 md:p-6">
            <DialogHeader className="gap-1 px-1 pr-12 sm:pr-14">
              <DialogTitle>Search the fragrance archive</DialogTitle>
              <DialogDescription>
                Use <span className="font-medium text-foreground">brand:</span> and{" "}
                <span className="font-medium text-foreground">family:</span> chips, navigate with arrow keys,
                and press Enter to open the full catalog.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={(event) => {
                event.preventDefault()
                submitSearch(query)
              }}
              className="flex min-h-0 flex-1 flex-col gap-3"
            >
              <div className="luxury-panel relative overflow-hidden rounded-[1.35rem] px-1 py-1 sm:rounded-[1.5rem] dark:bg-muted/30">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={paletteInputRef}
                  value={query}
                  onChange={(event) => updateQueryValue(event.target.value)}
                  onFocus={() => setActiveIndex(-1)}
                  onKeyDown={(event) => handleInputKeyDown(event, showPaletteResults)}
                  placeholder='Try "brand:Dior", "family:amber", or "oud vanilla"...'
                  className="h-13 rounded-[1.1rem] border-0 bg-luxury-soft pl-11 pr-4 text-base shadow-none sm:h-14 sm:rounded-[1.2rem] sm:pr-32 dark:bg-background/40"
                />
                <div className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 items-center gap-2 md:flex">
                  <span className="luxury-kbd rounded-md px-2 py-1 text-[10px] uppercase tracking-[0.2em] dark:bg-background/50 dark:text-muted-foreground">
                    Esc
                  </span>
                  <span className="luxury-kbd rounded-md px-2 py-1 text-[10px] uppercase tracking-[0.2em] dark:bg-background/50 dark:text-muted-foreground">
                    Enter
                  </span>
                </div>
              </div>

              <SearchAssistRow
                activeFilters={parsedQuery.filters}
                onRemoveFilter={removeFilter}
                onInsertFilterPrefix={insertFilterPrefix}
              />

              {showPaletteResults ? (
                <Card
                  data-lenis-prevent
                  data-lenis-prevent-wheel
                  data-lenis-prevent-touch
                  className="luxury-shell-strong flex min-h-0 flex-1 overflow-hidden rounded-[1.5rem] p-2 sm:rounded-[1.8rem] dark:bg-card"
                >
                  <SearchResultsPanel
                    query={query}
                    highlightQuery={highlightQuery}
                    activeFilters={parsedQuery.filters}
                    results={results}
                    brands={brands}
                    recentSearches={recentSearches}
                    clearRecents={clearRecents}
                    isLoading={isLoading}
                    selectableIndexMap={selectableIndexMap}
                    activeIndex={activeIndex}
                    setActiveIndex={setActiveIndex}
                    activateEntry={activateEntry}
                    setItemRef={setItemRef}
                    panelMode="dialog"
                  />
                </Card>
              ) : (
                <Card className="luxury-shell-strong overflow-hidden rounded-[1.5rem] p-5 sm:rounded-[1.8rem] sm:p-6 dark:bg-card">
                  <div className="grid gap-3">
                    <div className="luxury-meta text-[11px] uppercase tracking-[0.2em]">
                      Query chips
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="rounded-full">
                        brand:dior
                      </Badge>
                      <Badge variant="secondary" className="rounded-full">
                        family:amber
                      </Badge>
                      <Badge variant="secondary" className="rounded-full">
                        oud vanilla
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Start typing to preview matching brands and fragrances, or reuse recent searches.
                    </p>
                  </div>
                </Card>
              )}
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
