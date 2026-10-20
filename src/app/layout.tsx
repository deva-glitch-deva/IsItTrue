import type { Metadata, Viewport } from "next";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/manrope";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { BottomNav } from "@/components/layout/bottom-nav";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Is It True? — Your pocket lie detector",
    template: "%s · Is It True?",
  },
  description:
    "A neutral, AI-assisted fact checker for Instagram Reels and text claims. Evidence, sources and confidence — never absolute truth.",
  applicationName: "Is It True",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Is It True",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon-192.svg",
  },
  openGraph: {
    title: "Is It True?",
    description:
      "Paste a claim. Drop a Reel. Upload a clip. Get the receipts, not a lecture.",
    type: "website",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Is It True?",
    description: "Your pocket lie detector. Evidence first, ego never.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#12100d" },
    { media: "(prefers-color-scheme: light)", color: "#f5edde" },
  ],
};

const themeScript = `
(function () {
  try {
    var raw = localStorage.getItem('iit-settings-v1');
    var settings = raw ? JSON.parse(raw) : {};
    var theme = settings.theme === 'light' ? 'light' : 'dark';
    document.documentElement.classList.add(theme);
    if (settings.reducedMotion) document.documentElement.classList.add('reduced-motion');
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <AppProviders>
          <a
            href="#main-content"
            className="sr-only z-[200] rounded-lg bg-hot px-4 py-3 font-bold text-[#1a0e08] focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main id="main-content" className="overflow-x-hidden">
            {children}
          </main>
          <SiteFooter />
          <BottomNav />
        </AppProviders>
      </body>
    </html>
  );
}
