import Link from "next/link"

import { ArrowRight, Search } from "lucide-react"

import { FragranceCard } from "@/components/fragrance-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FAMILY_OPTIONS, listFragrances } from "@/lib/fragrances"

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function buildQueryString(
  current: Record<string, string | string[] | undefined>,
  updates: Record<string, string | undefined>
) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(current)) {
    const single = getSingleValue(value)
    if (single) params.set(key, single)
  }

  for (const [key, value] of Object.entries(updates)) {
    if (!value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
  }

  const query = params.toString()
  return query ? `/perfumes?${query}` : "/perfumes"
}

export default async function PerfumesPage(props: PageProps<"/perfumes">) {
  const searchParams = await props.searchParams
  const query = getSingleValue(searchParams.q)
  const family = getSingleValue(searchParams.family) || "all"
  const sort = getSingleValue(searchParams.sort) || "featured"
  const page = Number(getSingleValue(searchParams.page) || "1")

  const data = await listFragrances({
    query,
    family,
    sort,
    page: Number.isFinite(page) ? page : 1,
    perPage: 12,
  })

  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "rating", label: "Top rated" },
    { value: "year", label: "Newest" },
    { value: "price-asc", label: "Price low" },
    { value: "price-desc", label: "Price high" },
  ]

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-6 md:px-10 lg:px-12">
      <section className="luxury-shell grid gap-6 rounded-[2rem] px-6 py-8 md:px-8 dark:bg-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge variant="secondary" className="text-muted-foreground">
              Catalog
            </Badge>
            <h1 className="font-heading text-4xl tracking-tight md:text-5xl">
              Browse live perfume archive.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              Search by brand or fragrance name, filter by family, and open full note
              pyramids from Supabase-backed Fragella data.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {data.total} fragrances
            {data.totalPages > 1 ? ` · Page ${data.page} of ${data.totalPages}` : ""}
          </div>
        </div>

        <form className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="luxury-panel relative overflow-hidden rounded-[1.35rem] px-1 py-1 dark:bg-muted/30">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              defaultValue={query}
              placeholder="Search Dior, Chanel, Oud, Sauvage..."
              className="h-13 rounded-[1.15rem] border-0 bg-luxury-soft pl-10 shadow-none dark:bg-background/40"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <input type="hidden" name="family" value={family} />
            <input type="hidden" name="sort" value={sort} />
            <Button type="submit" className="h-13 rounded-[1.15rem] px-6">
              Search
            </Button>
          </div>
        </form>

        <div className="flex flex-wrap gap-2">
          {FAMILY_OPTIONS.map((option) => (
            <Button
              key={option}
              variant={family === option ? "default" : "outline"}
              size="sm"
              className={
                family === option
                  ? "rounded-[1rem] border-0 luxury-chip-solid px-4 hover:bg-luxury-ink/90"
                  : "rounded-[1rem] border-0 luxury-chip-soft px-4 hover:bg-luxury-hover dark:bg-muted/30 dark:text-foreground dark:hover:bg-muted/50"
              }
              asChild
            >
              <Link
                href={buildQueryString(searchParams, {
                  family: option === "all" ? undefined : option,
                  page: undefined,
                })}
              >
                {option === "all" ? "All families" : option}
              </Link>
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {sortOptions.map((option) => (
            <Button
              key={option.value}
              variant={sort === option.value ? "default" : "outline"}
              size="sm"
              className={
                sort === option.value
                  ? "rounded-[1rem] border-0 luxury-chip-solid px-4 hover:bg-luxury-ink/90"
                  : "rounded-[1rem] border-0 luxury-chip-soft px-4 hover:bg-luxury-hover dark:bg-muted/30 dark:text-foreground dark:hover:bg-muted/50"
              }
              asChild
            >
              <Link
                href={buildQueryString(searchParams, {
                  sort: option.value === "featured" ? undefined : option.value,
                  page: undefined,
                })}
              >
                {option.label}
              </Link>
            </Button>
          ))}
        </div>
      </section>

      <section className="py-8">
        {data.items.length ? (
          <div className="grid auto-rows-fr items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
            {data.items.map((fragrance: (typeof data.items)[number]) => (
              <FragranceCard key={fragrance.id} fragrance={fragrance} />
            ))}
          </div>
        ) : (
          <Card className="border border-border/60 bg-card/95">
            <CardContent className="py-12 text-center text-muted-foreground">
              No fragrances match current filters. Try broader search.
            </CardContent>
          </Card>
        )}
      </section>

      {data.totalPages > 1 ? (
        <section className="pb-12">
          <Card className="luxury-shell rounded-[2rem] dark:bg-card">
            <CardHeader>
              <CardTitle className="text-lg tracking-[0.12em] normal-case">
                Catalog pages
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="outline"
                disabled={data.page <= 1}
                asChild={data.page > 1}
              >
                {data.page > 1 ? (
                  <Link
                    href={buildQueryString(searchParams, { page: String(data.page - 1) })}
                  >
                    Previous
                  </Link>
                ) : (
                  <span>Previous</span>
                )}
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {data.page} of {data.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={data.page >= data.totalPages}
                asChild={data.page < data.totalPages}
              >
                {data.page < data.totalPages ? (
                  <Link
                    href={buildQueryString(searchParams, { page: String(data.page + 1) })}
                  >
                    Next
                    <ArrowRight />
                  </Link>
                ) : (
                  <span>Next</span>
                )}
              </Button>
            </CardContent>
          </Card>
        </section>
      ) : null}
    </main>
  )
}
