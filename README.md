# MandateGuard

**Compliance-first retry engine for failed UPI Autopay / NACH mandates.**

Most retry systems for failed recurring payments retry blindly — hammering banks
until something sticks, risking NPCI penalty thresholds and blacklisting. MandateGuard
enforces hard, deterministic NPCI retry-window rules first (no negotiation, no AI
involved), and only *then* lets an AI layer optimize **when** within that window a
retry is most likely to succeed — with every decision written to an append-only
audit trail a compliance officer can actually read.

**Track:** AI Revenue Recovery · **Stack:** MERN + Groq

[Live demo](https://mandateguard-three.vercel.app/)

---

## The problem

UPI Autopay and NACH mandate payments fail for specific, recurring reasons —
insufficient funds, expired mandates, bank timeouts. Real banks and NPCI enforce
strict retry rules: limited attempts, mandatory gap days between retries, and
penalty risk for over-retrying. Most systems don't model this at all.

## How it works

1. **A mandate fails.** The failure and its reason are logged immediately.
2. **A deterministic rules engine checks compliance.** Given the failure reason and
   retry history, it returns either an allowed retry window or a hard block — with
   zero AI involvement. This is a pure function, unit-tested against edge cases
   (already-at-max-retries, mandate-expires-mid-sequence).
3. **If eligible, AI optimizes timing — inside the window only.** An LLM (Groq)
   suggests the best specific timestamp within the compliance-allowed window (e.g.
   near a likely salary date). **If the AI ever suggests a time outside that
   window, the system discards it and falls back to the earliest compliant time** —
   this fallback is itself logged as an audit event.
4. **Every decision is logged.** Failure, compliance check, AI suggestion (or
   fallback), and execution outcome are all written to an audit trail in
   plain language.

## Architecture

```
Failure event
     │
     ▼
Rules Engine (deterministic, no AI)
     │
     ├─ not eligible ──────────────► Mandate blocked, logged
     │
     └─ eligible
          │
          ▼
     AI Layer (Groq) suggests optimal retry time within window
          │
          ├─ suggestion outside window ──► Fallback to window start, logged
          │
          └─ suggestion valid ──► Scheduled
                                      │
                                      ▼
                          node-cron scheduler executes retry
                                      │
                          ┌───────────┴───────────┐
                          ▼                       ▼
                      Success                   Failure
                   → Recovered            → Re-check eligibility (loop)
```

Full request/response flow, models, and endpoints are documented inline in `/server/src`.

## Tech stack

- **Frontend:** React (Vite) + Tailwind CSS v4, Socket.io client, Framer Motion
- **Backend:** Node.js + Express, Mongoose (MongoDB Atlas)
- **Scheduling:** node-cron
- **AI:** Groq (`openai/gpt-oss-20b`)
- **Real-time:** Socket.io
- **Deployment:** Vercel (frontend) + Render (backend) + MongoDB Atlas

## Compliance rules (researched, not assumed)

Rules are derived from NPCI's UPI Autopay policy (effective August 2025: max 4
total attempts — 1 original + 3 retries) and general NACH re-presentment practice.
Full research notes with sources: [`data/retry-rules.md`](data/retry-rules.md).
The exact same rules are rendered as an in-app reference on the **Compliance Rules**
page of the dashboard.

**Known simplifications** (stated honestly, not hidden):
- The real 24h/72h/168h staggered retry sequence is simplified to a flat minimum-gap
  value per failure reason.
- NPCI's non-peak execution-hour windowing (before 10 AM / 1–5 PM / after 9:30 PM)
  is not implemented.
- UPI Autopay and NACH are treated under one unified rule set for scope reasons.

## Honest metrics (Phase 5 — full synthetic batch, no cherry-picking)

Run against a 60-event synthetic dataset (`data/synthetic-mandates.json`) covering
all 6 failure categories plus edge cases (already-at-max-retries,
mandate-expires-mid-sequence):

| Snapshot | Recovered | Blocked | Retrying | Recovery Rate |
|---|---|---|---|---|
| Live, immediately after ingest | 1 | 18 | 45 | 5.3% |
| After fast-forwarding gap-day windows | 33 | 26 | 5 | 55.9% |

The 5.3% live snapshot is included deliberately — it shows the system respects
mandatory gap-day windows rather than instantly resolving everything, which is the
whole point of the compliance layer. At least one genuine blocked case (e.g. an
`account_frozen` mandate, correctly non-retryable) is walked through in the demo
rather than cherry-picking only successes.

## Features

- Compliance-first deterministic rules engine (unit-tested)
- Bounded AI layer with a hard compliance-window fallback (never overrides rules)
- node-cron scheduler simulating realistic retry timing and outcomes
- Full audit trail — per-mandate and global, searchable/filterable, exportable to CSV
- Live dashboard: Overview, Mandates, Audit Log, Snapshots, Compliance Rules
- Real-time updates via Socket.io (no polling)
- Metrics snapshot capture for before/after trend comparison
- Simulate-failure form for live demos (no Postman needed)
- Dark mode

## Project structure

```
mandateguard/
├── data/                    # Research + synthetic dataset (Phase 0)
├── server/
│   ├── src/
│   │   ├── rules-engine/    # Deterministic compliance logic (Phase 1)
│   │   ├── scheduler/       # node-cron retry processor (Phase 2)
│   │   ├── services/        # AI layer, retry simulation (Phase 3)
│   │   ├── models/          # Mongoose schemas
│   │   ├── controllers/     # API logic
│   │   └── routes/
│   ├── scripts/             # Batch runner, fast-forward simulator (Phase 5)
│   └── tests/                # Rules engine unit tests
└── client/
    └── src/
        └── components/       # Dashboard views (Phase 4)
```

## Running locally

**Backend:**
```bash
cd server
npm install
cp .env.example .env   # fill in MONGODB_URI, GROQ_API_KEY, CLIENT_ORIGIN
npm run dev
```

**Frontend:**
```bash
cd client
npm install
# create .env.local with VITE_API_URL and VITE_SOCKET_URL pointing to your backend
npm run dev
```

**Run the test suite:**
```bash
cd server
node --test tests/retryEligibility.test.js
```

**Run the full synthetic batch:**
```bash
cd server
node scripts/runBatch.js
```

## Production readiness notes

This is a hackathon MVP — no authentication is implemented, and all endpoints are
open. In production:
- JWT-based auth for dashboard access; API key or mTLS for merchant-side webhook
  ingestion (the `/failure` endpoint would be called by a bank/PSP integration,
  not end users)
- Rate limiting is already in place (`express-rate-limit`) as a first step —
  production would add per-merchant API keys with their own limits
- Audit logs are append-only by design (no update/delete routes exist) — a
  deliberate compliance choice
