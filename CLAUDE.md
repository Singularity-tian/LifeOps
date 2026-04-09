# LifeOps

AI-powered personal chatbot with Discord-like layout (channels) and Apple-inspired design.
Choices-first UX: AI asks clarifying questions and presents clickable option cards.

## Tech Stack
- Next.js 16, React 19, Tailwind CSS v4, pnpm
- AI: Azure OpenAI (GPT-5.4) via `openai` SDK
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
- `AZURE_API_KEY` — Azure OpenAI API key
- `AZURE_BASE_URL` — e.g. `https://<resource>.services.ai.azure.com/openai/v1`

## Architecture
- `app/api/chat/route.ts` — streaming chat endpoint (SSE)
- `app/api/channels/` — channel CRUD
- `lib/llm.ts` — Azure OpenAI client (generate, generateStructured, generateStream)
- `lib/db/` — Neon client, schema, repository
- `lib/prompts.ts` — system prompts with choices-first instructions
- `lib/memory.ts` — conversation summarization
- `components/` — React components (layout, chat, channels)
- `hooks/` — React hooks (useChannels, useMessages, useChat)
