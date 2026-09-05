import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Plus_Jakarta_Sans } from "next/font/google";
import { MotionProvider } from "@/components/layout/motion-provider";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE } from "@/config/site";
import { organizationSchema, websiteSchema } from "@/lib/structured-data";
import "@/styles/globals.css";

/*
 * Typefaces from the approved design system. Both are variable fonts, so one
 * file per family covers every weight the system uses.
 *
 * Bodoni Moda carries display and headline type only; loading it without
 * `preload` would delay the hero, so it is preloaded alongside the body face.
 */
const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bodoni-moda",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.displayName} — ${SITE.tagline}`,
    template: `%s — ${SITE.displayName}`,
  },
  description: `${SITE.displayName} is a Nigerian food brand. ${SITE.tagline}`,
  applicationName: SITE.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: SITE.locale,
    url: SITE.url,
  },
  twitter: { card: "summary_large_image" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Not capped — pinch-zoom is an accessibility requirement.
  // Deep Cocoa, the system's primary brand anchor.
  themeColor: "#4a1b07",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-NG" className={`${bodoniModa.variable} ${plusJakartaSans.variable}`}>
      <body className="font-sans antialiased">
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
