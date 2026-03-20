# Personal Admin Chatbot

AI-powered personal chatbot with Discord-like layout (channels) and Apple-inspired design.
Choices-first UX: AI asks clarifying questions and presents clickable option cards.

## Tech Stack
- Next.js 16, React 19, Tailwind CSS v4, pnpm
- AI: Anthropic Foundry SDK (Azure-hosted Claude Sonnet 4.6)
- DB: Neon Postgres (@neondatabase/serverless)
- Deploy: Vercel

## Commands
- `pnpm dev` — start dev server (turbopack)
- `pnpm build` — production build
- `pnpm migrate` — run database migrations
- `pnpm typecheck` — type check
- `pnpm lint` — lint

## Environment Variables
- `DATABASE_URL` — Neon Postgres connection string
- `ANTHROPIC_FOUNDRY_API_KEY` — Azure Foundry API key
- `ANTHROPIC_FOUNDRY_BASE_URL` — Azure Foundry base URL

## Architecture
- `app/api/chat/route.ts` — streaming chat endpoint (SSE)
- `app/api/channels/` — channel CRUD
- `lib/llm.ts` — Anthropic Foundry client (generate, generateStructured, generateStream)
- `lib/db/` — Neon client, schema, repository
- `lib/prompts.ts` — system prompts with choices-first instructions
- `lib/memory.ts` — conversation summarization
- `components/` — React components (layout, chat, channels)
- `hooks/` — React hooks (useChannels, useMessages, useChat)
