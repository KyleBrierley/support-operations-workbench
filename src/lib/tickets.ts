import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type Ticket,
  type TicketPriority,
  type TicketStatus,
} from "./ticket-types";

export { TICKET_PRIORITIES, TICKET_STATUSES };
export type { Ticket, TicketPriority, TicketStatus };

export type TicketFilters = {
  status?: TicketStatus | "all";
  priority?: TicketPriority | "all";
  assignee?: string | "all" | "unassigned";
  query?: string;
};

type CreateTicketInput = {
  title: string;
  customer: string;
  email: string;
  summary: string;
  priority?: TicketPriority;
  tags?: string[];
};

type UpdateTicketInput = Partial<{
  title: string;
  customer: string;
  email: string;
  summary: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigneeId: string | null;
  tags: string[];
  note: string;
}>;

function getDataFile() {
  return (
    process.env.TICKET_DATA_FILE ??
    path.join(process.cwd(), "src", "data", "tickets.json")
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStatus(value: unknown): value is TicketStatus {
  return TICKET_STATUSES.includes(value as TicketStatus);
}

function isPriority(value: unknown): value is TicketPriority {
  return TICKET_PRIORITIES.includes(value as TicketPriority);
}

function cleanString(value: unknown, field: string, minLength = 1) {
  if (typeof value !== "string") {
    throw new Error(`${field} must be a string.`);
  }

  const trimmed = value.trim();
  if (trimmed.length < minLength) {
    throw new Error(`${field} is required.`);
  }

  return trimmed;
}

function cleanTags(value: unknown): string[] {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error("tags must be an array.");
  }

  return value
    .map((tag) => cleanString(tag, "tag"))
    .filter(Boolean)
    .slice(0, 5);
}

export function parseCreateTicketPayload(payload: unknown): CreateTicketInput {
  if (!isRecord(payload)) {
    throw new Error("Request body must be an object.");
  }

  const priority = payload.priority ?? "medium";
  if (!isPriority(priority)) {
    throw new Error("priority must be low, medium, high, or urgent.");
  }

  return {
    title: cleanString(payload.title, "title", 3),
    customer: cleanString(payload.customer, "customer", 2),
    email: cleanString(payload.email, "email", 3),
    summary: cleanString(payload.summary, "summary", 8),
    priority,
    tags: cleanTags(payload.tags),
  };
}

export function parseUpdateTicketPayload(payload: unknown): UpdateTicketInput {
  if (!isRecord(payload)) {
    throw new Error("Request body must be an object.");
  }

  const update: UpdateTicketInput = {};

  if (payload.title !== undefined) {
    update.title = cleanString(payload.title, "title", 3);
  }
  if (payload.customer !== undefined) {
    update.customer = cleanString(payload.customer, "customer", 2);
  }
  if (payload.email !== undefined) {
    update.email = cleanString(payload.email, "email", 3);
  }
  if (payload.summary !== undefined) {
    update.summary = cleanString(payload.summary, "summary", 8);
  }
  if (payload.status !== undefined) {
    if (!isStatus(payload.status)) {
      throw new Error("status must be open, pending, or resolved.");
    }
    update.status = payload.status;
  }
  if (payload.priority !== undefined) {
    if (!isPriority(payload.priority)) {
      throw new Error("priority must be low, medium, high, or urgent.");
    }
    update.priority = payload.priority;
  }
  if (payload.assigneeId !== undefined) {
    update.assigneeId =
      payload.assigneeId === null
        ? null
        : cleanString(payload.assigneeId, "assigneeId");
  }
  if (payload.tags !== undefined) {
    update.tags = cleanTags(payload.tags);
  }
  if (payload.note !== undefined) {
    update.note = cleanString(payload.note, "note", 3);
  }

  return update;
}

export async function readTickets(): Promise<Ticket[]> {
  const raw = await readFile(getDataFile(), "utf8");
  return JSON.parse(raw) as Ticket[];
}

async function writeTickets(tickets: Ticket[]) {
  await writeFile(getDataFile(), `${JSON.stringify(tickets, null, 2)}\n`);
}

export async function listTickets(filters: TicketFilters = {}) {
  const tickets = await readTickets();
  const query = filters.query?.trim().toLowerCase();

  return tickets
    .filter((ticket) => {
      if (
        filters.status &&
        filters.status !== "all" &&
        ticket.status !== filters.status
      ) {
        return false;
      }

      if (
        filters.priority &&
        filters.priority !== "all" &&
        ticket.priority !== filters.priority
      ) {
        return false;
      }

      if (filters.assignee && filters.assignee !== "all") {
        if (filters.assignee === "unassigned") {
          return ticket.assigneeId === null;
        }

        if (ticket.assigneeId !== filters.assignee) {
          return false;
        }
      }

      if (!query) {
        return true;
      }

      return [
        ticket.title,
        ticket.customer,
        ticket.email,
        ticket.summary,
        ticket.priority,
        ticket.status,
        ...ticket.tags,
        ...ticket.notes,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getTicket(id: string) {
  const tickets = await readTickets();
  return tickets.find((ticket) => ticket.id === id) ?? null;
}

export async function createTicket(input: CreateTicketInput) {
  const tickets = await readTickets();
  const now = new Date().toISOString();
  const ticket: Ticket = {
    id: randomUUID(),
    title: input.title,
    customer: input.customer,
    email: input.email,
    summary: input.summary,
    status: "open",
    priority: input.priority ?? "medium",
    assigneeId: null,
    tags: input.tags ?? [],
    notes: [],
    createdAt: now,
    updatedAt: now,
  };

  await writeTickets([ticket, ...tickets]);
  return ticket;
}

export async function updateTicket(id: string, input: UpdateTicketInput) {
  const tickets = await readTickets();
  const index = tickets.findIndex((ticket) => ticket.id === id);

  if (index === -1) {
    return null;
  }

  const current = tickets[index];
  const next: Ticket = {
    ...current,
    ...input,
    notes: input.note ? [...current.notes, input.note] : current.notes,
    updatedAt: new Date().toISOString(),
  };
  delete (next as Partial<Ticket> & { note?: string }).note;

  tickets[index] = next;
  await writeTickets(tickets);
  return next;
}
