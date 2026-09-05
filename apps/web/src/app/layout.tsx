import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Epilogue, Space_Grotesk } from "next/font/google";
import { MotionProvider } from "@/components/layout/motion-provider";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE } from "@/config/site";
import { organizationSchema, websiteSchema } from "@/lib/structured-data";
import "@/styles/globals.css";

/*
 * The three typefaces of the approved design system, each with one job:
 * Bodoni Moda for headlines, Epilogue for body copy, Space Grotesk for labels
 * and metadata. All three are variable fonts, so one file per family covers
 * every weight the system uses.
 */
const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bodoni-moda",
});

const epilogue = Epilogue({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-epilogue",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
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
  // Toasted Terracotta, the system's focal brand colour.
  themeColor: "#a84c2c",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-NG"
      className={`no-js ${bodoniModa.variable} ${epilogue.variable} ${spaceGrotesk.variable}`}
    >
      <head>
        {/*
          Scroll reveals are driven by IntersectionObserver. Without scripting
          they would sit at opacity 0 forever, so the document starts marked
          `no-js` and this strips the mark before first paint — leaving the
          fallback rule in effect only when JS genuinely never runs.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.remove('no-js')`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
