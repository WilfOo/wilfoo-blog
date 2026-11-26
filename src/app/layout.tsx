import type { Metadata, Viewport } from "next";
import "./globals.css";
import { sans, serif } from "@/lib/fonts";
import { site } from "@/lib/site";
import { themeScript } from "@/lib/theme";
import { motionScript } from "@/lib/motion";
import { ThemeProvider } from "@/components/theme-provider";
import { SmoothScroll } from "@/components/smooth-scroll";
import { ContourBackground } from "@/components/contour-background";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CommandPalette } from "@/components/command-palette";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  authors: [{ name: site.author, url: site.url }],
  creator: site.author,
  applicationName: site.name,
  keywords: ["Wilfred", "个人博客", "笔记", "随笔", "阅读"],
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [{ url: "/feed.xml", title: `${site.name} · RSS` }],
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: site.url,
    siteName: site.name,
    title: site.title,
    description: site.description,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: site.title }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: ["/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${sans.variable} ${serif.variable} no-js`} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: motionScript }} />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.remove('no-js');`,
          }}
        />
        <noscript>
          <style>{`.no-js [style*="opacity:0"],.no-js [style*="opacity: 0"]{opacity:1!important}.no-js [style*="transform"]{transform:none!important}`}</style>
        </noscript>
        <ThemeProvider>
          <ContourBackground />
          <SmoothScroll />
          <div className="relative z-10 flex min-h-dvh flex-col">
            <a href="#main" className="skip-link">
              跳到正文
            </a>
            <SiteHeader />
            <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
              {children}
            </main>
            <SiteFooter />
          </div>
          <CommandPalette />
        </ThemeProvider>
      </body>
    </html>
  );
}
