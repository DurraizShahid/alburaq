import type { Metadata } from "next"
import Link from "next/link"
import {
  CircleHelp,
  Clock3,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  Sparkles,
  Truck,
} from "lucide-react"

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
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { companyDetails, supportFaqs, supportHighlights } from "@/lib/company"

export const metadata: Metadata = {
  title: "Support | Alburaq Atelier",
  description:
    "Support centre for Al Buraq LTD with customer care details, common help topics, and fragrance assistance.",
}

const supportActions = [
  {
    title: "Order help",
    description: "Tracking questions, delivery updates, or issues after checkout.",
    icon: PackageCheck,
  },
  {
    title: "Shipping guidance",
    description: "Delivery timing, parcel concerns, and return-related support.",
    icon: Truck,
  },
  {
    title: "Scent assistance",
    description: "Recommendations for gifting, layering, and choosing a fragrance family.",
    icon: Sparkles,
  },
] as const

export default function SupportPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-8 md:px-10 lg:px-12">
      <section className="luxury-shell grid gap-6 rounded-[2rem] px-6 py-8 md:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div className="space-y-4">
          <Badge variant="secondary" className="text-muted-foreground">
            Support
          </Badge>
          <div className="space-y-4">
            <h1 className="font-heading text-4xl tracking-tight md:text-5xl">
              Customer support for orders, delivery, and scent advice.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
              This support page gives customers one place to find help topics, contact
              methods, support hours, and practical next steps before reaching out.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <a href={companyDetails.supportEmailHref}>Email customer support</a>
            </Button>
            <Button variant="outline" asChild>
              <a href={companyDetails.supportPhoneHref}>Call support</a>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact">Open contact page</Link>
            </Button>
          </div>
        </div>

        <Card className="border border-border/60 bg-card/95">
          <CardHeader>
            <Badge variant="secondary" className="w-fit text-muted-foreground">
              Quick details
            </Badge>
            <CardTitle className="text-xl tracking-[0.14em] normal-case">
              Reach the support team
            </CardTitle>
            <CardDescription>
              Monday to Friday support availability with direct phone and email access.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <Phone className="mt-1 size-4 text-primary" />
              <a href={companyDetails.supportPhoneHref} className="transition-colors hover:text-foreground">
                {companyDetails.supportPhoneDisplay}
              </a>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-1 size-4 text-primary" />
              <a href={companyDetails.supportEmailHref} className="break-all transition-colors hover:text-foreground">
                {companyDetails.supportEmail}
              </a>
            </div>
            <div className="flex items-start gap-3">
              <Clock3 className="mt-1 size-4 text-primary" />
              <p>{companyDetails.supportHours}</p>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 size-4 text-primary" />
              <address className="not-italic">
                <p>{companyDetails.name}</p>
                {companyDetails.addressLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </address>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {supportActions.map((action) => {
          const Icon = action.icon

          return (
            <Card key={action.title} className="border border-border/60 bg-card/95">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-full border border-border/60 p-3">
                    <Icon className="size-4 text-primary" />
                  </div>
                  <CardTitle className="text-base tracking-[0.12em] normal-case">
                    {action.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-muted-foreground">{action.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="border border-border/60 bg-card/95">
          <CardHeader>
            <Badge variant="secondary" className="w-fit text-muted-foreground">
              Help topics
            </Badge>
            <CardTitle className="text-xl tracking-[0.14em] normal-case">
              Common support requests
            </CardTitle>
            <CardDescription>
              Start with the most frequent reasons customers contact the team.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {supportHighlights.map((item) => (
              <div key={item.title} className="rounded-[1.25rem] border border-border/60 bg-background/70 p-4">
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-border/60 bg-card/95">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CircleHelp className="size-4 text-primary" />
              <CardTitle className="text-xl tracking-[0.14em] normal-case">Support FAQ</CardTitle>
            </div>
            <CardDescription>
              Key guidance for customers before they contact support.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              {supportFaqs.map((item) => (
                <AccordionItem key={item.question} value={item.question}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm leading-7 text-muted-foreground">{item.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card className="border border-border/60 bg-card/95">
          <CardHeader>
            <CardTitle className="text-xl tracking-[0.14em] normal-case">
              Before you contact support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
            <p>Have your order number ready when the question relates to a recent purchase.</p>
            <p>Use email for detailed issues that need screenshots, tracking numbers, or multiple order details.</p>
            <p>Use phone support during support hours when you want direct guidance quickly.</p>
          </CardContent>
        </Card>

        <Card className="border border-border/60 bg-card/95">
          <CardHeader>
            <CardTitle className="text-xl tracking-[0.14em] normal-case">
              Need another route?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/contact"
              className="block text-sm leading-7 text-muted-foreground transition-colors hover:text-foreground"
            >
              Visit the contact page for the full company address and direct contact options.
            </Link>
            <Link
              href="/perfumes"
              className="block text-sm leading-7 text-muted-foreground transition-colors hover:text-foreground"
            >
              Return to the fragrance catalog after reviewing support information.
            </Link>
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>
          Customer support hours: {companyDetails.supportHours}
        </p>
        <div className="flex flex-wrap gap-4">
          <a href={companyDetails.supportEmailHref} className="transition-colors hover:text-foreground">
            Email support
          </a>
          <a href={companyDetails.supportPhoneHref} className="transition-colors hover:text-foreground">
            Call support
          </a>
          <a
            href={companyDetails.mapsHref}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-foreground"
          >
            View address
          </a>
        </div>
      </section>
    </main>
  )
}
