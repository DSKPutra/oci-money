# OCI.money — On-Chain Intelligence Directory

A searchable, filterable directory of on-chain intelligence platforms — forensics, smart money,
market analytics, data & query, protocol fundamentals, DEX/trading tools, block explorers, and
security. Live at **[oci.money](https://oci.money)**.

## Features

- Hero search with real-time filtering across name, description, and category (`/` to focus)
- Category (multi-select), pricing, and favorites-only filters
- Sort by A–Z, category, or favorites-first
- Grid and table views
- Add, edit, and delete custom platforms via a validated modal form (stored in `localStorage`)
- Export the full directory to JSON or CSV; import platforms from a JSON file
- Dark mode by default, with a light mode toggle (respects system preference on first visit)
- English/Indonesian language toggle
- Fully responsive, keyboard-accessible, and ARIA-labeled
- No backend — built-in data ships in `src/data/platforms.json`, user data lives in `localStorage`

## Tech stack

React + Vite + TypeScript + Tailwind CSS. Static output in `dist/`, deployable as-is to Vercel,
Netlify, or Cloudflare Pages.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Build

```bash
npm run build
npm run preview
```

## Adding a platform

Two ways:

1. **In the UI** — click "Add platform" and fill in the form (name and URL are required, URL is
   validated). Custom entries are tagged with a "Custom" badge and persist in your browser's
   `localStorage`.
2. **In the source data** — add an entry to [`src/data/platforms.json`](src/data/platforms.json)
   following the existing shape:

   ```json
   {
     "id": "kebab-case-id",
     "name": "Platform Name",
     "category": "One of the eight fixed categories",
     "url": "https://example.com",
     "pricing": "Free | Freemium | Paid | Enterprise",
     "description": "One-sentence English description.",
     "descriptionId": "Deskripsi satu kalimat dalam Bahasa Indonesia."
   }
   ```

## Project structure

```
src/
  components/   UI components (cards, filters, modal, etc.)
  data/         Built-in platforms.json dataset
  hooks/        useLocalStorage, usePlatforms, useTheme
  i18n/         English/Indonesian translations + provider
  types/        Shared TypeScript types
  utils/        exportJson / exportCsv / parseImportedJson
```

## Deployments

| Target | URL |
| --- | --- |
| Primary (Vercel) | https://oci.money |
| Vercel project | https://oci-money.vercel.app |
| Netlify mirror | https://oci-money.netlify.app |
| Cloudflare Pages mirror | https://oci-money.pages.dev |
| Source | https://github.com/DSKPutra/oci-money |

## Disclaimer

Listings are for informational purposes only and are not endorsements or financial advice.
