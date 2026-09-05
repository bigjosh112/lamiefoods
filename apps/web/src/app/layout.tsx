import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { MotionProvider } from "@/components/layout/motion-provider";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE } from "@/config/site";
import { organizationSchema, websiteSchema } from "@/lib/structured-data";
import "@/styles/globals.css";

// Provisional typeface. Final brand typography follows the approved design.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
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
  themeColor: "#2a1a12",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-NG" className={inter.variable}>
      <body className="font-sans antialiased">
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
