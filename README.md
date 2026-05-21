# Support Ticket Practice App

A small full-stack Next.js app for practicing the Codex Deployment Engineering interview loop:

1. Understand the ticket.
2. Inspect the codebase.
3. Ask Codex for scoped changes.
4. Validate behavior.
5. Review the diff and explain risk.

The app uses App Router route handlers, a file-backed ticket store, a client queue UI, and TypeScript tests.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Useful checks:

```bash
npm run lint
npm run typecheck
npm test
npm run validate
```

## Code Map

- `src/components/ticket-workbench.tsx` - queue UI and client-side interactions.
- `src/app/api/tickets/route.ts` - list and create tickets.
- `src/app/api/tickets/[id]/route.ts` - read and update one ticket.
- `src/lib/tickets.ts` - validation, filtering, and file-backed persistence.
- `src/lib/ticket-types.ts` - browser-safe shared ticket types and constants.
- `src/data/tickets.json` - seed ticket data.
- `tests/tickets.test.ts` - focused domain tests.
- `docs/interview-drills.md` - practice tickets.

## Practice Prompt Shape

```text
Goal: implement [ticket].
Context: inspect AGENTS.md, package.json, src/lib/tickets.ts, and the relevant route/component files first.
Constraints: keep the change small, use existing helpers, avoid new production dependencies.
Done when: focused tests cover the change, npm run validate passes, and the final diff is reviewed.
First summarize the plan, then implement.
```

## Reset Seed Data

The dev app writes to `src/data/tickets.json`. Restore the seed data with Git:

```bash
git checkout -- src/data/tickets.json
```
