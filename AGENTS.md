<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Interview Practice Rules

- Inspect `package.json`, `src/lib/tickets.ts`, API routes, and this file before editing.
- Keep changes scoped to the support-ticket behavior requested in the ticket.
- Prefer existing helpers in `src/lib/tickets.ts` over duplicating validation in route handlers.
- Do not add production dependencies unless the ticket clearly needs one.
- After code changes, run `npm run validate` when time allows. If time is short, run the narrowest relevant check and explain the tradeoff.
- Before finalizing, review `git diff` and summarize behavior changes plus residual risks.
