import {
  getTicket,
  parseUpdateTicketPayload,
  updateTicket,
} from "@/lib/tickets";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const ticket = await getTicket(id);

  if (!ticket) {
    return Response.json({ error: "Ticket not found." }, { status: 404 });
  }

  return Response.json({ ticket });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const input = parseUpdateTicketPayload(await request.json());
    const ticket = await updateTicket(id, input);

    if (!ticket) {
      return Response.json({ error: "Ticket not found." }, { status: 404 });
    }

    return Response.json({ ticket });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Invalid request." },
      { status: 400 },
    );
  }
}
