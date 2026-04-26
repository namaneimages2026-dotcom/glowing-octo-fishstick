# Namane Supply OS (Local-First)

Namane Supply OS is a local-first operations app for laser fabrication workflows. It is designed to run fully on a laptop first, then connect outward when needed.

## Architecture (master goals implemented)

- **Local-first:** all operational state is stored in browser local storage through a snapshot store (`src/lib/store.ts`).
- **Offline-capable:** service worker + app manifest are included (`public/sw.js`, `public/manifest.webmanifest`).
- **QR-ready:** item labels can be generated as QR images in-app through an in-app QR-style SVG generator (`src/lib/qr.ts`).
- **Connector-ready:** pluggable connector interface with example adapters for GitHub dispatch and ERP webhook (`src/connectors/index.ts`).
- **GitHub deployable:** Vite static build output can be deployed to GitHub Pages or any static host.

## Functional modules

- Inventory management with low stock visibility.
- Work order intake and tracking.
- Scan station for stock movements and QR generation.
- Offline sync queue with connector push.

## Run local

```bash
npm install
npm run dev
```

## Build for deploy

```bash
npm run build
```

Then publish `dist/` using GitHub Pages, Netlify, Vercel, or Cloudflare Pages.
