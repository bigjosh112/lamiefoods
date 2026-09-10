# Vendored fonts

## General Sans

`GeneralSans-Variable.woff2` (upright) and `GeneralSans-VariableItalic.woff2`
(italic). Both carry the full `wght` 200–700 axis, so these two files cover
every weight the design system uses — 400 body, 500 medium, 600 semibold,
700 bold — without a file per weight.

- **Foundry:** Indian Type Foundry (ITF)
- **Source:** <https://www.fontshare.com/fonts/general-sans>
- **Licence:** ITF Free Font License (FFL) — free for personal and commercial
  use. Redistribution as a standalone font product is not permitted; bundling
  the webfont inside a website, as here, is.

### Why these are vendored rather than fetched

General Sans is **not on Google Fonts** — `fonts.googleapis.com` returns
`400 Bad Request` for it — so `next/font/google` cannot load it the way it
loads Fraunces. The alternative was Fontshare's hosted stylesheet
(`api.fontshare.com/v2/css`), which would add a render-blocking third-party
request to every page and disclose visitor IPs to another host. Vendoring the
two cuts and loading them through `next/font/local` keeps every font byte on
our own origin, which is also what `next/font/google` does for Fraunces.

### Re-fetching or upgrading

The URLs are content-hashed and change between releases, so read them from the
stylesheet rather than hardcoding them:

```bash
curl -sL "https://api.fontshare.com/v2/css?f[]=general-sans@variable"
```

The two `@font-face` blocks declaring `font-weight: 200 700` are the variable
cuts — one `font-style: normal`, one `font-style: italic`. Download each
block's `.woff2` and overwrite the files here, keeping the names. Nothing else
needs to change: `app/layout.tsx` references them by path only.

## Fraunces

Not vendored. It is on Google Fonts and is self-hosted at build time by
`next/font/google` in `app/layout.tsx`, so no font request leaves for a third
party at runtime either. Licence: SIL Open Font License 1.1.
