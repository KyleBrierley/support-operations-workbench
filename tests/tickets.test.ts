import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  createTicket,
  listTickets,
  parseCreateTicketPayload,
  parseUpdateTicketPayload,
  updateTicket,
} from "../src/lib/tickets";

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(path.join(tmpdir(), "tickets-test-"));
  process.env.TICKET_DATA_FILE = path.join(tempDir, "tickets.json");
  await writeFile(process.env.TICKET_DATA_FILE, "[]\n");
});

afterEach(async () => {
  delete process.env.TICKET_DATA_FILE;
  await rm(tempDir, { recursive: true, force: true });
});

test("creates an open ticket with normalized input", async () => {
  const input = parseCreateTicketPayload({
    title: " Login failure ",
    customer: "Acme",
    email: "ops@acme.example",
    summary: "Users cannot log in from SSO.",
    priority: "high",
    tags: [" auth ", "sso"],
  });

  const ticket = await createTicket(input);

  assert.equal(ticket.title, "Login failure");
  assert.equal(ticket.status, "open");
  assert.equal(ticket.priority, "high");
  assert.deepEqual(ticket.tags, ["auth", "sso"]);
});

test("filters tickets by customer email and status", async () => {
  await createTicket(
    parseCreateTicketPayload({
      title: "Export issue",
      customer: "Northstar",
      email: "maya@northstar.example",
      summary: "CSV export times out for admins.",
      priority: "urgent",
    }),
  );
  const second = await createTicket(
    parseCreateTicketPayload({
      title: "Mobile drawer",
      customer: "Aster",
      email: "help@aster.example",
      summary: "Drawer clips the requester name.",
      priority: "low",
    }),
  );
  await updateTicket(second.id, parseUpdateTicketPayload({ status: "resolved" }));

  const emailMatches = await listTickets({ query: "northstar.example" });
  const resolvedMatches = await listTickets({ status: "resolved" });

  assert.equal(emailMatches.length, 1);
  assert.equal(emailMatches[0].customer, "Northstar");
  assert.equal(resolvedMatches.length, 1);
  assert.equal(resolvedMatches[0].title, "Mobile drawer");
});

test("filters tickets by note text", async () => {
  const ticket = await createTicket(
    parseCreateTicketPayload({
      title: "Billing invite conflict",
      customer: "Northstar",
      email: "maya@northstar.example",
      summary: "Second billing admin invite returns a conflict.",
      priority: "urgent",
    }),
  );
  await updateTicket(
    ticket.id,
    parseUpdateTicketPayload({
      note: "Customer reproduced this twice from the production workspace.",
    }),
  );

  const matches = await listTickets({ query: "production workspace" });

  assert.equal(matches.length, 1);
  assert.equal(matches[0].id, ticket.id);
});

test("filters tickets by assigned user", async () => {
  const samTicket = await createTicket(
    parseCreateTicketPayload({
      title: "Billing invite conflict",
      customer: "Northstar",
      email: "maya@northstar.example",
      summary: "Second billing admin invite returns a conflict.",
      priority: "urgent",
    }),
  );
  const leeTicket = await createTicket(
    parseCreateTicketPayload({
      title: "Export issue",
      customer: "Pinebox",
      email: "ops@pinebox.example",
      summary: "CSV export times out for admins.",
      priority: "high",
    }),
  );
  await updateTicket(samTicket.id, parseUpdateTicketPayload({ assigneeId: "sam" }));
  await updateTicket(leeTicket.id, parseUpdateTicketPayload({ assigneeId: "lee" }));

  const matches = await listTickets({ assignee: "sam" });

  assert.equal(matches.length, 1);
  assert.equal(matches[0].id, samTicket.id);
});

test("filters tickets by unassigned assignee", async () => {
  const unassignedTicket = await createTicket(
    parseCreateTicketPayload({
      title: "Search issue",
      customer: "Aster",
      email: "help@aster.example",
      summary: "Search does not return matching tickets.",
      priority: "medium",
    }),
  );
  const assignedTicket = await createTicket(
    parseCreateTicketPayload({
      title: "Export issue",
      customer: "Pinebox",
      email: "ops@pinebox.example",
      summary: "CSV export times out for admins.",
      priority: "high",
    }),
  );
  await updateTicket(assignedTicket.id, parseUpdateTicketPayload({ assigneeId: "lee" }));

  const matches = await listTickets({ assignee: "unassigned" });

  assert.equal(matches.length, 1);
  assert.equal(matches[0].id, unassignedTicket.id);
});

test("composes assignee filtering with status", async () => {
  const openSamTicket = await createTicket(
    parseCreateTicketPayload({
      title: "Billing invite conflict",
      customer: "Northstar",
      email: "maya@northstar.example",
      summary: "Second billing admin invite returns a conflict.",
      priority: "urgent",
    }),
  );
  const resolvedSamTicket = await createTicket(
    parseCreateTicketPayload({
      title: "Mobile drawer",
      customer: "Riverfront",
      email: "admin@riverfront.example",
      summary: "Drawer clips the requester name.",
      priority: "low",
    }),
  );
  await updateTicket(
    openSamTicket.id,
    parseUpdateTicketPayload({ assigneeId: "sam" }),
  );
  await updateTicket(
    resolvedSamTicket.id,
    parseUpdateTicketPayload({ assigneeId: "sam", status: "resolved" }),
  );

  const matches = await listTickets({ assignee: "sam", status: "resolved" });

  assert.equal(matches.length, 1);
  assert.equal(matches[0].id, resolvedSamTicket.id);
});

test("rejects invalid update payloads", () => {
  assert.throws(
    () => parseUpdateTicketPayload({ status: "closed" }),
    /status must be open, pending, or resolved/,
  );
});
