import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans, Playfair_Display } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { cn } from "@/lib/utils";
import { CartProvider } from "@/components/cart-provider";
import { SmoothScroll } from "@/components/smooth-scroll";
import { GlobalSearchBar } from "@/components/global-search-bar";
import { SiteFooter } from "@/components/site-footer";

const playfairDisplayHeading = Playfair_Display({subsets:['latin'],variable:'--font-heading'});

const notoSans = Noto_Sans({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alburaq Atelier | Luxury Perfume House",
  description:
    "Discover signature perfumes, discovery rituals, gifting sets, and concierge scent matching at Alburaq Atelier.",
  icons: {
    icon: [
      { url: "/logo-dark.png", type: "image/png" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/logo-dark.png",
    apple: "/logo-dark.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        notoSans.variable,
        playfairDisplayHeading.variable
      )}
    >
      <body
        suppressHydrationWarning
        className="min-h-full bg-background text-foreground selection:bg-primary selection:text-primary-foreground flex flex-col"
      >
        <CartProvider>
          <SmoothScroll>
            <Suspense fallback={null}>
              <GlobalSearchBar />
            </Suspense>
            {children}
            <SiteFooter />
          </SmoothScroll>
        </CartProvider>
      </body>
    </html>
  )
}
