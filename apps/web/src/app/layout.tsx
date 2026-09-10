import type { Metadata, Viewport } from "next";
import { Fraunces } from "next/font/google";
import localFont from "next/font/local";
import { MotionProvider } from "@/components/layout/motion-provider";
import { CartHydration } from "@/lib/cart/cart-hydration";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE } from "@/config/site";
import { organizationSchema, websiteSchema } from "@/lib/structured-data";
import "@/styles/globals.css";

/*
 * The two typefaces of the brand system, each with one job: Fraunces for
 * display (headlines, product names, prices), General Sans for everything a
 * person reads or operates (body copy, navigation, buttons, labels, and the
 * whole admin). Both are variable, so one file per style covers every weight.
 *
 * They load by different routes because they come from different places:
 *
 *   Fraunces is on Google Fonts, so `next/font/google` self-hosts it at build
 *   time — no request ever leaves for fonts.googleapis.com. `opsz` is opted
 *   into so the optical-size axis is available: this face runs from an 11px
 *   eyebrow to a 72px hero, and with the axis present browsers apply
 *   `font-optical-sizing: auto` and thicken hairlines at small sizes on their
 *   own. Italic is a real cut, not a synthesised slant — five headline accent
 *   lines and one body paragraph depend on it.
 *
 *   General Sans is NOT on Google Fonts. It is an Indian Type Foundry face
 *   distributed through Fontshare, so the two variable cuts are vendored into
 *   `src/fonts/` and loaded with `next/font/local`. See the README there for
 *   the licence and how to re-fetch them. Linking Fontshare's CDN stylesheet
 *   instead would have put a render-blocking third-party request in front of
 *   every page and leaked visitor IPs to another host.
 *
 * Both expose a CSS variable and nothing else. Components never name a family;
 * `--font-display` and `--font-body` in globals.css are the only place these
 * two are bound to a role, which is what makes the pair swappable.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-fraunces",
});

const generalSans = localFont({
  src: [
    {
      path: "../fonts/GeneralSans-Variable.woff2",
      weight: "200 700",
      style: "normal",
    },
    {
      path: "../fonts/GeneralSans-VariableItalic.woff2",
      weight: "200 700",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-general-sans",
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
    <html lang="en-NG" className={`${fraunces.variable} ${generalSans.variable}`}>
      <head>
        {/*
          Scroll reveals are driven by IntersectionObserver; without scripting
          they would sit at opacity 0 forever.

          The browser applies this stylesheet only when scripting is disabled,
          so no class toggling and no inline script are involved. An earlier
          version marked <html> with `no-js` and had a script strip it, which
          made the server and client markup disagree and logged a hydration
          mismatch on every page load.
        */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<style>[data-reveal]{opacity:1!important;transform:none!important}</style>`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        <CartHydration />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
