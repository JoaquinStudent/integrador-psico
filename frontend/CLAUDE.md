# CLAUDE.md

## Project Overview

Psicograma is a clinical psychology tool for automating projective drawing test reports. It captures the temporal dimension of drawings (stroke order, timing, pressure, pauses, erases) and cross-references ~149 indicators from the PBLL (Persona bajo la lluvia) test manual.

Two interfaces synced in real-time via Supabase Realtime:
- **Patient interface** (tablet): drawing canvas adapted from Ink Playground
- **Examiner interface** (desktop): live session monitoring, observations, analysis, report editor

## Stack

React 19 + TypeScript + Vite | Supabase (Postgres, Auth, Storage, Realtime, Edge Functions) | Vercel
AI: OpenAI Whisper (audio transcription) | OpenRouter SDK (LLM suggestions)

## Build Commands

```bash
npm install
cp .env.example .env     # Fill in Supabase credentials
npm run dev              # http://localhost:5173
npm run build            # TypeScript + Vite production build
npm run lint             # ESLint
```

## Architecture

- `src/lib/` — Supabase client, auth context
- `src/types/` — Database types, shared interfaces
- `src/components/layout/` — AppLayout, Sidebar
- `src/components/` — Shared components (ProtectedRoute)
- `src/pages/` — Route-level page components

## Design System

Clinical Precision — see `../mocks/design-system/design.md`
- Font: Inter (400, 500, 600, 700)
- Primary: Deep Violet #251D4B (sidebar, headings)
- Action: #453A7D (buttons)
- Semantic: Amber #C97A1F (AI suggestions), Green #2E7D5B (validated), Red #C0523F (recording/errors)
- Background: #F7F8FC, Surface: #FFFFFF
- CSS variables defined in `src/index.css`

## Conventions

- UI language: Spanish
- All mocks in `../mocks/` (13 pantallas con screen.png + code.html, mas design-system y logo)
- Test manual in `../sdd/manual-pbll/manual-persona-bajo-la-lluvia.md`
