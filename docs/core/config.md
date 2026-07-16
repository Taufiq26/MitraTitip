<!-- devpilot-config -->
# Konfigurasi Proyek

| Key | Value |
|---|---|
| Nama proyek | MitraTitip |
| Tipe proyek | Web app (PWA, multi-tenant SaaS) |
| Bahasa dokumen | Indonesia |
| Folder docs | docs |
| Dibuat | 2026-07-16 |
| Versi devpilot | 0.1.0 |

## Divisi

<!-- Divisi tim yang disepakati, dipakai untuk estimasi mandays dan gantt. Dikerjakan solo, tetap dipecah per divisi untuk perencanaan. -->
- Frontend
- Backend
- UI/UX
- QA
- DevOps

## Ringkasan stack

Next.js 14 (TypeScript) + Tailwind CSS + shadcn/ui, Supabase (Postgres + Auth + Realtime), PWA offline-first dengan Dexie.js (IndexedDB), deploy ke Vercel.

## Dokumen aktif

| Dokumen | Aktif | Catatan |
|---|---|---|
| requirements.md | ya | |
| features.md | ya | |
| tech-stack.md | ya | |
| architecture.md | ya | |
| database.md | ya | multi-tenant dengan RLS |
| api-contract.md | ya | endpoint custom untuk sync, settlement, registrasi tenant |
| phases.md | ya | |
| backlog.md | ya | |
