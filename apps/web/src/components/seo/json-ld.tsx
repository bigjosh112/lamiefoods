/**
 * Renders a JSON-LD block.
 *
 * JSON-LD has to go in via `dangerouslySetInnerHTML` — there is no other way to
 * emit a raw script body. Product and order data will eventually flow through
 * here from the API, so `<` is escaped to `<`: without it a value
 * containing `</script>` would close the tag early and turn structured data into
 * an XSS vector.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\u003c");

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
