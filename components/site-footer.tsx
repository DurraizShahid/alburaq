import Image from "next/image"
import Link from "next/link"

import ShinyText from "@/components/ShinyText"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { companyDetails } from "@/lib/company"

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-12">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 md:px-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr] lg:px-12">
        <div className="space-y-4">
          <div className="flex flex-col items-start gap-0">
            <Image
              src="/logo-dark.png"
              alt="Alburaq Atelier logo"
              width={344}
              height={94}
              className="h-auto w-[200px] md:w-[220px]"
            />
            <ShinyText
              text="Perfume as atmosphere."
              speed={4}
              className="ml-1 text-[9px] leading-none tracking-[0.24em] uppercase"
              color="#8f7046"
              shineColor="#f3dba7"
            />
          </div>
          <p className="max-w-sm text-sm leading-7 text-muted-foreground">
            A modern perfume house for signature scents, thoughtful gifting, and wardrobe-building
            rituals designed around mood, memory, and skin.
          </p>
          <div className="flex flex-wrap gap-3 text-xs tracking-[0.28em] uppercase text-muted-foreground">
            <span>Dubai</span>
            <span>Paris</span>
            <span>Worldwide dispatch</span>
          </div>
        </div>

        <div className="space-y-4">
          <Badge variant="secondary" className="text-muted-foreground">
            Shop
          </Badge>
          <div className="grid gap-3 text-sm text-muted-foreground">
            <Link href="/#collections" className="transition-colors hover:text-foreground">
              Signature perfumes
            </Link>
            <Link href="/perfumes" className="transition-colors hover:text-foreground">
              Full catalog
            </Link>
            <Link href="/#finder" className="transition-colors hover:text-foreground">
              Scent finder
            </Link>
            <Link href="/perfumes?sort=rating" className="transition-colors hover:text-foreground">
              Top rated
            </Link>
            <Link href="/#gifting" className="transition-colors hover:text-foreground">
              Discovery sets
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <Badge variant="secondary" className="text-muted-foreground">
            Support
          </Badge>
          <div className="grid gap-4 text-sm text-muted-foreground">
            <div className="grid gap-2">
              <Link href="/support" className="transition-colors hover:text-foreground">
                Support centre
              </Link>
              <Link href="/contact" className="transition-colors hover:text-foreground">
                Contact page
              </Link>
            </div>
            <div className="space-y-1">
              <p className="text-xs tracking-[0.24em] uppercase text-foreground/80">
                Customer support
              </p>
              <a href={companyDetails.supportPhoneHref} className="block transition-colors hover:text-foreground">
                {companyDetails.supportPhoneDisplay}
              </a>
              <a
                href={companyDetails.supportEmailHref}
                className="block break-all transition-colors hover:text-foreground"
              >
                {companyDetails.supportEmail}
              </a>
            </div>
            <div className="space-y-1">
              <p className="text-xs tracking-[0.24em] uppercase text-foreground/80">
                Support hours
              </p>
              <p>{companyDetails.supportHours}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs tracking-[0.24em] uppercase text-foreground/80">Address</p>
              <address className="space-y-1 not-italic">
                <p>{companyDetails.name}</p>
                {companyDetails.addressLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </address>
            </div>
          </div>
        </div>

        <Card className="border border-border/60 bg-card/95">
          <CardHeader>
            <Badge variant="secondary" className="text-muted-foreground">
              House list
            </Badge>
            <CardTitle className="text-xl tracking-[0.14em] normal-case">
              Join for launches, refills, and private edits.
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input type="email" placeholder="Email address" />
            <Button className="w-full">Subscribe</Button>
            <p className="text-sm leading-6 text-muted-foreground">
              Early access to new releases, sample drops, and seasonal gift curation.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-12">
        <Separator className="my-8" />

        <div className="flex flex-col gap-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Image
              src="/logo-dark.png"
              alt="Alburaq Atelier logo"
              width={344}
              height={94}
              className="h-auto w-[150px]"
            />
            <p>© 2026 Alburaq Atelier. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/#collections" className="transition-colors hover:text-foreground">
              Privacy
            </Link>
            <Link href="/#collections" className="transition-colors hover:text-foreground">
              Terms
            </Link>
            <Link href="/support" className="transition-colors hover:text-foreground">
              Support
            </Link>
            <Link href="/contact" className="transition-colors hover:text-foreground">
              Contact
            </Link>
            <a href={companyDetails.supportEmailHref} className="transition-colors hover:text-foreground">
              Email
            </a>
            <a href={companyDetails.supportPhoneHref} className="transition-colors hover:text-foreground">
              Call
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
