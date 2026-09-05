import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Crunch } from "@/components/landing/crunch";
import { FinalCta } from "@/components/landing/final-cta";
import { Flavours } from "@/components/landing/flavours";
import { Hero } from "@/components/landing/hero";
import { Horizon } from "@/components/landing/horizon";
import { Manifesto } from "@/components/landing/manifesto";
import { Moments } from "@/components/landing/moments";
import { Pillars } from "@/components/landing/pillars";
import { JsonLd } from "@/components/seo/json-ld";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/structured-data";

/*
 * Copy here stays natural and descriptive. The category terms that matter for
 * search — Nigerian chinchin, premium snacks — appear because they genuinely
 * describe the product, not because they were stuffed in.
 */
export const metadata: Metadata = buildMetadata({
  title: "Premium Nigerian Chinchin",
  description:
    "Lamie Foods makes small-batch Nigerian chinchin in three flavours — Milky Velvet, Coco Velvet and Cinnamon. Crafted for good taste.",
  path: "/",
});

/**
 * The landing page.
 *
 * Every section is a Server Component. Only the header (mobile menu), the hero
 * sequence and the scroll-reveal wrapper opt into the client, which keeps the
 * page's JavaScript to the parts that genuinely need interaction.
 *
 * No Product structured data yet: prices and availability in the content file
 * are unconfirmed placeholders, and publishing them as machine-readable offers
 * would misrepresent the business to search engines. It lands with real pricing.
 */
export default function HomePage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }])} />
      <SiteHeader />
      <main id="main">
        <Hero />
        <Manifesto />
        <Pillars />
        <Crunch />
        <Flavours />
        <Moments />
        <Horizon />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
