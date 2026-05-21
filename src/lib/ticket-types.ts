export const TICKET_STATUSES = ["open", "pending", "resolved"] as const;
export const TICKET_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export type Ticket = {
  id: string;
  title: string;
  customer: string;
  email: string;
  summary: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigneeId: string | null;
  tags: string[];
  notes: string[];
  createdAt: string;
  updatedAt: string;
};
