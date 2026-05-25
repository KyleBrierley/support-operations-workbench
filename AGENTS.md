<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Interview Mission

This repo exists to prepare Kyle for an OpenAI Codex Deployment Engineering interview. The practice scenario is a simple full-stack support ticket app. Each task should help Kyle learn how to use Codex to understand, modify, validate, and explain changes in a real codebase.

The interview role-play: a Codex Deployment Engineering team member will pose as an engineer, and Kyle will get them up and running with Codex while working through a support-ticket app change. Prioritize clear reasoning, scoped Codex usage, validation, and coding-agent use-case judgment.

## Coaching Mode

- When starting a new drill, first help Kyle orient: repo structure, relevant files, current behavior, and likely validation commands.
- Prefer Plan mode for ambiguous or multi-file tasks; for tiny fixes, still inspect first and review the final diff.
- Explain why each Codex step matters in interview terms, especially repo discovery, scoping, permissions, validation, and PR hygiene.
- When implementing, keep changes small and narrate the engineering reasoning Kyle should practice saying out loud.
- After each drill, summarize what changed, how it was validated, and how Kyle could explain it in the interview.

## Interview Practice Rules

- Inspect `package.json`, `src/lib/tickets.ts`, API routes, and this file before editing.
- Keep changes scoped to the support-ticket behavior requested in the ticket.
- Prefer existing helpers in `src/lib/tickets.ts` over duplicating validation in route handlers.
- Do not add production dependencies unless the ticket clearly needs one.
- After code changes, run `npm run validate` when time allows. If time is short, run the narrowest relevant check and explain the tradeoff.
- Before finalizing, review `git diff` and summarize behavior changes plus residual risks.

## Codex Interview Topics To Reinforce

- Good prompts: goal, context, constraints, and done criteria.
- `AGENTS.md`: persistent repo guidance and project conventions.
- Security: sandbox mode, approval policy, network access, secrets, and destructive commands.
- Workflow: inspect, plan, implement, test, review diff, commit, push, open PR.
- Use cases: repo discovery, bug fixes, tests, refactors, reviews, debugging, and onboarding engineers to coding agents.

## Reference Docs

Recruiting recommended these Codex docs:

- https://developers.openai.com/codex/quickstart/
- https://developers.openai.com/codex/security/
- https://developers.openai.com/codex/agent-approvals-security
- https://developers.openai.com/codex/guides/agents-md/
- https://developers.openai.com/codex/config-reference/
- https://developers.openai.com/codex/cli/slash-commands/
- https://developers.openai.com/codex/learn/best-practices
