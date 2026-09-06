import type { Metadata } from "next";
import { ROUTES } from "@lamiefoods/config";
import {
  AboutCta,
  AboutHeritage,
  AboutHero,
  AboutHorizon,
  AboutSensory,
  AboutTenets,
} from "@/components/about/about-sections";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/structured-data";

export const metadata: Metadata = buildMetadata({
  title: "Our Heritage",
  description:
    "Lamie Foods is a Nigerian culinary house making small-batch chinchin in Lagos — whole dairy butter, freshly ground nutmeg, and unhurried kitchen craft.",
  path: ROUTES.about,
});

/**
 * About / heritage page.
 *
 * Entirely server-rendered; the only client boundary is `Reveal`. Building this
 * finally gives `/about` a real route — the nav and footer had been pointing at
 * the landing page's manifesto anchor because the page did not exist.
 */
export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Our Heritage", path: ROUTES.about },
        ])}
      />
      <SiteHeader />

      <main id="main">
        <AboutHero />
        <AboutHeritage />
        <AboutTenets />
        <AboutHorizon />
        <AboutSensory />
        <AboutCta />
      </main>

      <SiteFooter />
    </>
  );
}
