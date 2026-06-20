import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  Building2,
  Clock3,
  Mail,
  MapPin,
  Phone,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { companyDetails, supportHighlights } from "@/lib/company"

export const metadata: Metadata = {
  title: "Contact | Alburaq Atelier",
  description:
    "Contact Al Buraq LTD for customer support, fragrance guidance, order help, and business enquiries.",
}

const contactCards = [
  {
    title: "Call customer support",
    value: companyDetails.supportPhoneDisplay,
    href: companyDetails.supportPhoneHref,
    icon: Phone,
  },
  {
    title: "Email the team",
    value: companyDetails.supportEmail,
    href: companyDetails.supportEmailHref,
    icon: Mail,
  },
  {
    title: "Support hours",
    value: companyDetails.supportHours,
    icon: Clock3,
  },
] as const

export default function ContactPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-8 md:px-10 lg:px-12">
      <section className="luxury-shell grid gap-6 rounded-[2rem] px-6 py-8 md:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div className="space-y-4">
          <Badge variant="secondary" className="text-muted-foreground">
            Contact
          </Badge>
          <div className="space-y-4">
            <h1 className="font-heading text-4xl tracking-tight md:text-5xl">
              Speak with Alburaq customer care.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
              Reach out for order assistance, gifting support, fragrance questions, and
              business enquiries. The contact details below are now the main customer
              support points for the website.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <a href={companyDetails.supportEmailHref}>
                Email support
                <ArrowRight />
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href={companyDetails.supportPhoneHref}>Call {companyDetails.supportPhoneDisplay}</a>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/support">Open support page</Link>
            </Button>
          </div>
        </div>

        <Card className="border border-border/60 bg-card/95">
          <CardHeader>
            <Badge variant="secondary" className="w-fit text-muted-foreground">
              Visit or write
            </Badge>
            <CardTitle className="text-xl tracking-[0.14em] normal-case">
              Al Buraq LTD
            </CardTitle>
            <CardDescription>
              Unit 12, 20 River Road, Barking, England, IG11 0DG
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <address className="space-y-1 not-italic text-sm leading-6 text-muted-foreground">
              {companyDetails.addressLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </address>
            <Button variant="outline" asChild>
              <a href={companyDetails.mapsHref} target="_blank" rel="noreferrer">
                Open in maps
              </a>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {contactCards.map((item) => {
            const Icon = item.icon

            return (
              <Card key={item.title} className="border border-border/60 bg-card/95">
                <CardHeader className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full border border-border/60 p-3">
                      <Icon className="size-4 text-primary" />
                    </div>
                    <CardTitle className="text-base tracking-[0.12em] normal-case">
                      {item.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {"href" in item ? (
                    <a
                      href={item.href}
                      className="text-sm leading-7 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-sm leading-7 text-muted-foreground">{item.value}</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="border border-border/60 bg-card/95">
          <CardHeader>
            <Badge variant="secondary" className="w-fit text-muted-foreground">
              Helpful info
            </Badge>
            <CardTitle className="text-xl tracking-[0.14em] normal-case">
              What the team can help with
            </CardTitle>
            <CardDescription>
              Use the contact routes below for the most common customer support needs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {supportHighlights.map((item) => (
              <div key={item.title} className="space-y-1">
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="text-sm leading-7 text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Card className="border border-border/60 bg-card/95">
          <CardHeader>
            <div className="flex items-center gap-3">
              <MapPin className="size-4 text-primary" />
              <CardTitle className="text-base tracking-[0.12em] normal-case">Address</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-7 text-muted-foreground">
            <p>{companyDetails.name}</p>
            {companyDetails.addressLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-border/60 bg-card/95">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Building2 className="size-4 text-primary" />
              <CardTitle className="text-base tracking-[0.12em] normal-case">
                Customer care
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-7 text-muted-foreground">
            <p>
              Prefer email for detailed order issues and phone support for faster direct
              guidance during business hours.
            </p>
            <p>
              Include your order number when available so the team can respond more
              efficiently.
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border/60 bg-card/95">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Mail className="size-4 text-primary" />
              <CardTitle className="text-base tracking-[0.12em] normal-case">
                Related pages
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/support"
              className="block text-sm leading-7 text-muted-foreground transition-colors hover:text-foreground"
            >
              Visit the support page for FAQs and common help topics.
            </Link>
            <Link
              href="/perfumes"
              className="block text-sm leading-7 text-muted-foreground transition-colors hover:text-foreground"
            >
              Return to the catalog to continue browsing fragrances.
            </Link>
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>
          Need support now? Email <a href={companyDetails.supportEmailHref}>{companyDetails.supportEmail}</a> or call{" "}
          <a href={companyDetails.supportPhoneHref}>{companyDetails.supportPhoneDisplay}</a>.
        </p>
        <Link href="/support" className="transition-colors hover:text-foreground">
          Browse support topics
        </Link>
      </section>
    </main>
  )
}
