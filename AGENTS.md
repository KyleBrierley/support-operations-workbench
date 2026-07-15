<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Repository Mission

This repository is a working support operations ticket workbench and a reusable environment for AI-assisted scoped change and validation workflows. The application itself is a conventional full-stack Next.js app; do not describe it as a deployed AI product or imply that AI runs in the application.

Prioritize clear reasoning, narrow implementation scope, validation, and explicit review of behavior and risk.

## Working Mode

- When starting a new change, first orient to the repository structure, relevant files, current behavior, and likely validation commands.
- Prefer Plan mode for ambiguous or multi-file tasks; for tiny fixes, still inspect first and review the final diff.
- Explain important workflow choices, especially repository discovery, scoping, permissions, validation, and PR hygiene.
- When implementing, keep changes small and make the engineering reasoning legible in the plan and handoff.
- After each change, summarize what changed, how it was validated, and any residual risks.

## Change Rules

- Inspect `package.json`, `src/lib/tickets.ts`, API routes, and this file before editing.
- Keep changes scoped to the support-ticket behavior requested in the ticket.
- Prefer existing helpers in `src/lib/tickets.ts` over duplicating validation in route handlers.
- Do not add production dependencies unless the ticket clearly needs one.
- After code changes, run `npm run validate` when time allows. If time is short, run the narrowest relevant check and explain the tradeoff.
- Before finalizing, review `git diff` and summarize behavior changes plus residual risks.

## AI-Assisted Workflow Qualities

- Good task briefs include a goal, context, constraints, and done criteria.
- `AGENTS.md`: persistent repo guidance and project conventions.
- Security: sandbox mode, approval policy, network access, secrets, and destructive commands.
- Workflow: inspect, plan, implement, test, review diff, commit, push, open PR.
- Use cases: repo discovery, bug fixes, tests, refactors, reviews, debugging, and onboarding engineers to coding agents.

## Reference Docs

Relevant Codex documentation:

- https://developers.openai.com/codex/quickstart/
- https://developers.openai.com/codex/security/
- https://developers.openai.com/codex/agent-approvals-security
- https://developers.openai.com/codex/guides/agents-md/
- https://developers.openai.com/codex/config-reference/
- https://developers.openai.com/codex/cli/slash-commands/
- https://developers.openai.com/codex/learn/best-practices
