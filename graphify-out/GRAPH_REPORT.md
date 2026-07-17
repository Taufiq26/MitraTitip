# Graph Report - .  (2026-07-17)

## Corpus Check
- Corpus is ~19,546 words - fits in a single context window. You may not need a graph.

## Summary
- 502 nodes · 1035 edges · 36 communities (24 shown, 12 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 52 edges (avg confidence: 0.84)
- Token cost: 421,214 input · 0 output

## Community Hubs (Navigation)
- Consignment Batch API & Pages
- shadcn Alert/Avatar Components
- POS & Reports Client Code
- Consignor/Product Server Actions
- NPM Dependencies
- TypeScript Config
- Architecture & Agent Docs
- Build Tooling & Styling Config
- shadcn/ui Config
- Requirements & Feature Modules
- Database Schema
- Features & Execution Phases
- BL-2 Backlog: Nav Perf & Titipan UX
- PWA Manifest
- Root Layout & SW Registration
- Multi-Tenant Auth & RLS
- Auth Middleware
- Tenant Registration API
- Offline Sync Queue
- MitraTitip Brand Identity
- Next.js Scaffold Branding
- Window Icon Asset
- ESLint Config File
- Next.js Config File
- PostCSS Config File
- Service Worker Cache
- Admin Tenants Endpoint
- Settlement Preview Endpoint
- Settlement Finalize Endpoint
- Sync Pull Endpoint
- Tenant Register Endpoint
- Globe Icon Asset
- Vercel Logo Asset

## God Nodes (most connected - your core abstractions)
1. `cn()` - 81 edges
2. `createClient()` - 40 edges
3. `Requirements` - 34 edges
4. `getCurrentProfile()` - 33 edges
5. `Button()` - 21 edges
6. `compilerOptions` - 16 edges
7. `Tech Stack` - 15 edges
8. `Architecture` - 12 edges
9. `BL-1: Perbaiki urutan cascade delete saat penghapusan tenant` - 11 edges
10. `Input()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Phase 7 (proposed): Peningkatan Kasir & Penitip` --references--> `Execution Phases`  [AMBIGUOUS]
  docs/core/backlog.md → docs/core/phases.md
- `README.md (MitraTitip)` --references--> `Database Design`  [EXTRACTED]
  README.md → docs/core/database.md
- `README.md (MitraTitip)` --references--> `Features & Estimates`  [EXTRACTED]
  README.md → docs/core/features.md
- `README.md (MitraTitip)` --references--> `Execution Phases`  [EXTRACTED]
  README.md → docs/core/phases.md
- `README.md (MitraTitip)` --references--> `Requirements`  [EXTRACTED]
  README.md → docs/core/requirements.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Consignment Settlement Flow** — docs_core_database_consignors, docs_core_database_consignment_batches, docs_core_database_settlements, docs_core_api_contract_consignment_settlements, docs_core_api_contract_consignment_settlements_finalize, docs_core_features_barang_titipan, docs_core_phases_phase3 [INFERRED 0.85]
- **Offline-First Sync Flow** — docs_core_tech_stack_dexie_js, docs_core_architecture_indexeddb, docs_core_architecture_service_worker, docs_core_architecture_sync_queue, docs_core_api_contract_sync_push, docs_core_api_contract_sync_pull, docs_core_features_offline_sinkronisasi, docs_core_phases_phase4 [INFERRED 0.85]
- **Multi-Tenant Isolation Mechanism** — docs_core_architecture_row_level_security, docs_core_database_tenants, docs_core_requirements_fr22, docs_core_requirements_nfr1, docs_core_phases_phase1 [INFERRED 0.85]

## Communities (36 total, 12 thin omitted)

### Community 0 - "Consignment Batch API & Pages"
Cohesion: 0.08
Nodes (50): itemSchema, POST(), pushSchema, transactionSchema, createConsignmentBatch(), ConsignorDetailPage(), ConsignorsPage(), ADMIN_NAV (+42 more)

### Community 1 - "shadcn Alert/Avatar Components"
Cohesion: 0.06
Nodes (43): Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants, Avatar(), AvatarBadge(), AvatarFallback() (+35 more)

### Community 2 - "POS & Reports Client Code"
Cohesion: 0.08
Nodes (41): currencyFormatter, CartItem, currencyFormatter, PaymentMethod, DateRangeForm(), currencyFormatter, firstDayOfMonthIso(), PAYMENT_LABEL (+33 more)

### Community 3 - "Consignor/Product Server Actions"
Cohesion: 0.07
Nodes (38): ActionState, batchSchema, consignorSchema, createConsignor(), deleteConsignor(), returnConsignmentBatch(), updateConsignor(), ConsignorDialog() (+30 more)

### Community 4 - "NPM Dependencies"
Cohesion: 0.06
Nodes (33): @base-ui/react, class-variance-authority, clsx, dexie, lucide-react, next, next-themes, dependencies (+25 more)

### Community 5 - "TypeScript Config"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 6 - "Architecture & Agent Docs"
Cohesion: 0.11
Nodes (27): AGENTS.md (Next.js Agent Rules), Next.js Breaking-Changes Directive, API Contract, Architecture, IndexedDB (via Dexie.js), Next.js App (Vercel), Service Worker, Supabase Auth (+19 more)

### Community 7 - "Build Tooling & Styling Config"
Cohesion: 0.08
Nodes (25): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+17 more)

### Community 8 - "shadcn/ui Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 9 - "Requirements & Feature Modules"
Cohesion: 0.17
Nodes (22): Module: Laporan & Insight, Module: Manajemen Barang & Stok, Module: Transaksi Kasir (POS), Requirements, FR-1: Login Admin & Kasir terikat ke tenant, FR-13: Metode pembayaran tunai/QRIS/transfer, FR-14: Hitung kembalian otomatis (tunai), FR-15: Preview & cetak struk opsional (+14 more)

### Community 10 - "Database Schema"
Cohesion: 0.56
Nodes (11): BL-1: Perbaiki urutan cascade delete saat penghapusan tenant, Table: consignment_batches, Table: consignors, Database Design, Table: products, Table: profiles, Table: settlements, Table: tenants (+3 more)

### Community 11 - "Features & Execution Phases"
Cohesion: 0.29
Nodes (11): Features & Estimates, Module: Infrastruktur & Deployment, Module: Offline-First & Sinkronisasi, Execution Phases, Phase 2: Manajemen Barang & Stok, Phase 3: Barang Titipan (Consignment), Phase 4: Transaksi Kasir (POS) & Offline Mode, Phase 5: Laporan & Insight (+3 more)

### Community 12 - "BL-2 Backlog: Nav Perf & Titipan UX"
Cohesion: 0.24
Nodes (10): BL-2: Scan barcode tambah barang, performa navigasi, quick-add titipan, riwayat settlement, BatchDialog component (existing, reused for quick-add), Root cause: double auth round-trip (middleware + layout) causing navigation delay, Phase 7 (proposed): Peningkatan Kasir & Penitip, Module: Barang Titipan (Consignment), FR-10: Hitung otomatis bagian penitip saat barang terjual, FR-11: Retur barang titipan tidak terjual, FR-12: Rekap settlement titipan per penitip/periode (+2 more)

### Community 13 - "PWA Manifest"
Cohesion: 0.20
Nodes (9): background_color, description, display, icons, name, scope, short_name, start_url (+1 more)

### Community 14 - "Root Layout & SW Registration"
Cohesion: 0.29
Nodes (5): geistMono, geistSans, metadata, viewport, ServiceWorkerRegister()

### Community 15 - "Multi-Tenant Auth & RLS"
Cohesion: 0.33
Nodes (7): Row Level Security (tenant isolation), Module: Autentikasi & Multi-Tenant, FR-2: Login Super Admin ke panel monitoring tenant, FR-22: Isolasi data antar tenant sepenuhnya, FR-3: Pendaftaran tenant mandiri (self-service signup), NFR-1: Security — RLS berbasis tenant_id, Role: Super Admin

### Community 16 - "Auth Middleware"
Cohesion: 0.53
Nodes (4): config, middleware(), PUBLIC_PATHS, updateSession()

### Community 17 - "Tenant Registration API"
Cohesion: 0.60
Nodes (3): POST(), registerSchema, createAdminClient()

### Community 18 - "Offline Sync Queue"
Cohesion: 0.50
Nodes (4): POST /api/sync/push, Sync Queue (idempotent via local_id), NFR-3: Reliability — sync idempotent, transaksi offline tidak hilang, TanStack Query + custom sync queue

### Community 19 - "MitraTitip Brand Identity"
Cohesion: 0.67
Nodes (4): MitraTitip (Project/App Brand), MitraTitip App Icon (icon.svg), Dark Navy / White Brand Color Scheme (#0f172a / #ffffff), "MT" Monogram Wordmark

### Community 20 - "Next.js Scaffold Branding"
Cohesion: 0.67
Nodes (3): create-next-app Default Scaffold, Next.js Wordmark / Brand Identity, next.svg (Next.js Logo Asset)

## Ambiguous Edges - Review These
- `Execution Phases` → `Phase 7 (proposed): Peningkatan Kasir & Penitip`  [AMBIGUOUS]
  docs/core/backlog.md · relation: references
- `BL-2: Scan barcode tambah barang, performa navigasi, quick-add titipan, riwayat settlement` → `BatchDialog component (existing, reused for quick-add)`  [AMBIGUOUS]
  docs/core/backlog.md · relation: references

## Knowledge Gaps
- **148 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+143 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Execution Phases` and `Phase 7 (proposed): Peningkatan Kasir & Penitip`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `BL-2: Scan barcode tambah barang, performa navigasi, quick-add titipan, riwayat settlement` and `BatchDialog component (existing, reused for quick-add)`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **Why does `cn()` connect `shadcn Alert/Avatar Components` to `Consignment Batch API & Pages`, `POS & Reports Client Code`, `Consignor/Product Server Actions`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Why does `createClient()` connect `Consignment Batch API & Pages` to `POS & Reports Client Code`, `Consignor/Product Server Actions`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `Button()` connect `Consignor/Product Server Actions` to `Consignment Batch API & Pages`, `shadcn Alert/Avatar Components`, `POS & Reports Client Code`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _148 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Consignment Batch API & Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.07769973661106233 - nodes in this community are weakly interconnected._