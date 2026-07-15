# Change Scenarios

Use these as representative support operations change requests. For each scenario, orient to the current behavior, state a concise plan, implement the smallest coherent change, and validate the acceptance criteria.

## Scenario 1: Broken Search

The customer reports that searching by note text does not return matching tickets.

Done when:
- Search includes ticket notes.
- A focused test covers the behavior.
- `npm run validate` passes.

## Scenario 2: Add Assignment Filter

Support leads need to filter the queue by assignee, including unassigned tickets.

Done when:
- The API accepts an `assignee` query parameter.
- The UI exposes an assignee filter for Sam, Lee, and unassigned tickets.
- Existing filters continue to compose correctly.
- Focused tests cover assigned, unassigned, and composed filtering.

## Scenario 3: Resolution Note Requirement

Agents must add a note before moving a ticket to `resolved`.

Done when:
- The API rejects resolution without a note.
- The UI captures a note for resolution.
- Error states are visible and accessible.

## Scenario 4: Ticket Detail Route

Agents want a shareable URL for each ticket.

Done when:
- `/tickets/[id]` renders the ticket detail.
- Missing tickets return a not-found view.
- The queue links to the detail route without losing scanability.
