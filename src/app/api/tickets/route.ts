import {
  createTicket,
  listTickets,
  parseCreateTicketPayload,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/tickets";

function getFilter<T extends readonly string[]>(
  value: string | null,
  allowed: T,
): T[number] | "all" | undefined {
  if (!value || value === "all") {
    return value === "all" ? "all" : undefined;
  }

  return allowed.includes(value) ? value : undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tickets = await listTickets({
    status: getFilter(searchParams.get("status"), TICKET_STATUSES) as
      | TicketStatus
      | "all"
      | undefined,
    priority: getFilter(searchParams.get("priority"), TICKET_PRIORITIES) as
      | TicketPriority
      | "all"
      | undefined,
    query: searchParams.get("q") ?? undefined,
  });

  return Response.json({ tickets });
}

export async function POST(request: Request) {
  try {
    const input = parseCreateTicketPayload(await request.json());
    const ticket = await createTicket(input);
    return Response.json({ ticket }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Invalid request." },
      { status: 400 },
    );
  }
}
