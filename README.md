# LifeOps

An AI-powered personal life management chatbot. Organize your life into channels — fitness, finance, travel, career, anything — then just state your goal. The AI agent breaks it down, asks the right questions, and delivers an actionable plan.

<!-- TODO: add screenshot -->

## How It Works

1. **Create a channel** for any area of your life (e.g., "Fitness", "Q2 Planning", "Japan Trip")
2. **State your goal** — "I want to run a half marathon in 3 months"
3. **The AI decomposes the problem** — asks targeted questions to understand constraints, preferences, and context
4. **Get a concrete plan** — with interactive choice cards so you can tap through decisions instead of typing

## Features

- **Channels** — Discord-like layout to separate different life areas, each with its own context and memory
- **Choices-first UX** — AI presents interactive option cards at decision points; tap instead of type
- **Streaming responses** — real-time token-by-token output with smooth transitions
- **Conversation memory** — automatic summarization keeps the AI aware of past decisions across long threads
- **Google OAuth** — sign in with Google, data stays tied to your account

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16, React 19 |
| Styling | Tailwind CSS v4 |
| AI | Anthropic Foundry SDK (Claude Sonnet 4.6) |
| Database | Neon Postgres (serverless) |
| Auth | NextAuth v5 (Google OAuth) |
| Deploy | Vercel |

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

Copy the example and fill in your values:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon Postgres connection string |
| `AZURE_API_KEY` | Azure OpenAI API key |
| `AZURE_BASE_URL` | e.g. `https://<resource>.services.ai.azure.com/openai/v1` |
| `AUTH_SECRET` | NextAuth secret (`openssl rand -base64 32`) |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |

### 3. Run database migrations

```bash
pnpm migrate
```

### 4. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  api/chat/       — streaming chat endpoint (SSE)
  api/channels/   — channel CRUD
  login/          — login page
components/
  chat/           — message bubbles, choice cards, input
  channels/       — create/edit channel dialogs
  layout/         — sidebar, header
hooks/            — useChat, useMessages, useChannels
lib/
  llm.ts          — Anthropic Foundry client
  prompts.ts      — system prompts + choice parsing
  memory.ts       — conversation summarization
  db/             — Neon client, schema, repository
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm migrate` | Run database migrations |
| `pnpm typecheck` | Type check |
| `pnpm lint` | Lint |
