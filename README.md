# OCI.money — On-Chain Intelligence

OCI.money is both a **directory** of on-chain intelligence platforms and a small set of
**functional on-chain intelligence tools** built directly into the app, powered entirely by free
public APIs (Blockscout, mempool.space, Solana public RPC, DefiLlama, CoinGecko, GeckoTerminal) —
no backend, no API keys. Live at **[oci.money](https://oci.money)**.

## Pages

- **Directory** — searchable, filterable directory of on-chain intelligence platforms (forensics,
  smart money, market analytics, data & query, protocol fundamentals, DEX/trading tools, block
  explorers, security)
- **Explorer** — wallet/contract lookup across Ethereum, Base, Polygon, Bitcoin, and Solana:
  balances, token holdings, and recent transactions
- **Analytics** — top protocols and chains by TVL (DefiLlama), top assets by market cap
  (CoinGecko), and trending DEX pools (GeckoTerminal)
- **Smart Money** — a lightweight whale-watch: largest pending Bitcoin transfers, and top holder
  concentration for any ERC-20 token
- **Security** — screens an EVM address for scam flags/tags and basic risk heuristics using live
  block explorer data (not a substitute for enterprise tools like Chainalysis/TRM/Elliptic — see
  the Directory for those)

> **Scope note:** the functional tools are intentionally lightweight, client-side integrations
> against free/no-key public APIs. They are not a replacement for enterprise-grade platforms like
> Nansen, Chainalysis, or Glassnode — for those, see the Directory tab.

## Directory features

- Hero search with real-time filtering across name, description, and category (`/` to focus)
- Category (multi-select), pricing, and favorites-only filters
- Sort by A–Z, category, or favorites-first
- Grid and table views
- Add, edit, and delete custom platforms via a validated modal form (stored in `localStorage`)
- Export the full directory to JSON or CSV; import platforms from a JSON file
- Dark mode by default, with a light mode toggle (respects system preference on first visit)
- English/Indonesian language toggle (Directory only — the tool pages are English-only for now)
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
  components/   Shared UI components (cards, filters, modal, nav tabs, status boxes, etc.)
  pages/        DirectoryPage, ExplorerPage, AnalyticsPage, SmartMoneyPage, SecurityPage
  data/         Built-in platforms.json dataset
  hooks/        useLocalStorage, usePlatforms, useTheme, useAsync
  i18n/         English/Indonesian translations + provider (Directory page)
  lib/api/      Thin fetch clients for Blockscout, mempool.space, Solana RPC, DefiLlama,
                CoinGecko, GeckoTerminal
  types/        Shared TypeScript types
  utils/        exportJson / exportCsv / parseImportedJson / number & address formatting
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
