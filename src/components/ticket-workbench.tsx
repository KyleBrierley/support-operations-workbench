"use client";

import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Clock3,
  Loader2,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Send,
  UserRound,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type Ticket,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/ticket-types";

const priorityStyles: Record<TicketPriority, string> = {
  low: "border-emerald-200 bg-emerald-50 text-emerald-800",
  medium: "border-sky-200 bg-sky-50 text-sky-800",
  high: "border-amber-200 bg-amber-50 text-amber-900",
  urgent: "border-rose-200 bg-rose-50 text-rose-800",
};

const statusIcons: Record<TicketStatus, typeof Circle> = {
  open: Circle,
  pending: Clock3,
  resolved: CheckCircle2,
};

type FormState = {
  title: string;
  customer: string;
  email: string;
  summary: string;
  priority: TicketPriority;
  tags: string;
};

const emptyForm: FormState = {
  title: "",
  customer: "",
  email: "",
  summary: "",
  priority: "medium",
  tags: "",
};

export function TicketWorkbench() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<TicketStatus | "all">("all");
  const [priority, setPriority] = useState<TicketPriority | "all">("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedId) ?? tickets[0],
    [selectedId, tickets],
  );

  const counts = useMemo(
    () =>
      TICKET_STATUSES.reduce(
        (acc, item) => ({
          ...acc,
          [item]: tickets.filter((ticket) => ticket.status === item).length,
        }),
        {} as Record<TicketStatus, number>,
      ),
    [tickets],
  );

  const loadTickets = useCallback(async () => {
    const params = new URLSearchParams();
    if (status !== "all") {
      params.set("status", status);
    }
    if (priority !== "all") {
      params.set("priority", priority);
    }
    if (query.trim()) {
      params.set("q", query.trim());
    }

    try {
      const response = await fetch(`/api/tickets?${params.toString()}`);
      const payload = (await response.json()) as {
        tickets?: Ticket[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load tickets.");
      }

      setTickets(payload.tickets ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Unable to load tickets.",
      );
    } finally {
      setLoading(false);
    }
  }, [priority, query, status]);

  useEffect(() => {
    // Client-side polling of the local route handler is intentional for this practice app.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadTickets();
  }, [loadTickets]);

  function runFilterChange(update: () => void) {
    setLoading(true);
    setError(null);
    update();
  }

  async function updateStatus(ticket: Ticket, nextStatus: TicketStatus) {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const payload = (await response.json()) as {
        ticket?: Ticket;
        error?: string;
      };

      if (!response.ok || !payload.ticket) {
        throw new Error(payload.error ?? "Unable to update ticket.");
      }

      setTickets((current) =>
        current.map((item) =>
          item.id === payload.ticket?.id ? payload.ticket : item,
        ),
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Unable to update ticket.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function createNewTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: form.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      });
      const payload = (await response.json()) as {
        ticket?: Ticket;
        error?: string;
      };

      if (!response.ok || !payload.ticket) {
        throw new Error(payload.error ?? "Unable to create ticket.");
      }

      setTickets((current) => [payload.ticket as Ticket, ...current]);
      setSelectedId(payload.ticket.id);
      setForm(emptyForm);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Unable to create ticket.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8faf8] text-zinc-950">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-zinc-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-teal-700">
              Support Desk
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-zinc-950">
              Ticket operations
            </h1>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:w-[360px]">
            {TICKET_STATUSES.map((item) => {
              const Icon = statusIcons[item];

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    runFilterChange(() => setStatus(status === item ? "all" : item))
                  }
                  className={`flex h-16 items-center justify-between rounded-md border px-3 text-left transition ${
                    status === item
                      ? "border-zinc-950 bg-zinc-950 text-white"
                      : "border-zinc-200 bg-white hover:border-zinc-400"
                  }`}
                  title={`Filter ${item} tickets`}
                >
                  <span>
                    <span className="block text-lg font-semibold">
                      {counts[item] ?? 0}
                    </span>
                    <span className="block text-xs capitalize">{item}</span>
                  </span>
                  <Icon className="size-4" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </header>

        {error ? (
          <div className="flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            <AlertCircle className="size-4" aria-hidden="true" />
            {error}
          </div>
        ) : null}

        <section className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="flex min-h-0 flex-col gap-3">
            <div className="flex flex-col gap-3 rounded-md border border-zinc-200 bg-white p-3 sm:flex-row">
              <label className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                <span className="sr-only">Search tickets</span>
                <input
                  value={query}
                  onChange={(event) =>
                    runFilterChange(() => setQuery(event.target.value))
                  }
                  placeholder="Search title, customer, email, note, tag"
                  className="h-10 w-full rounded-md border border-zinc-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-teal-700"
                />
              </label>
              <label>
                <span className="sr-only">Priority</span>
                <select
                  value={priority}
                  onChange={(event) =>
                    runFilterChange(() =>
                      setPriority(event.target.value as TicketPriority | "all"),
                    )
                  }
                  className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm capitalize outline-none transition focus:border-teal-700 sm:w-40"
                >
                  <option value="all">All priorities</option>
                  {TICKET_PRIORITIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  void loadTickets();
                }}
                className="flex h-10 items-center justify-center rounded-md border border-zinc-200 px-3 transition hover:border-zinc-400"
                title="Refresh tickets"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <RefreshCw className="size-4" aria-hidden="true" />
                )}
                <span className="sr-only">Refresh tickets</span>
              </button>
            </div>

            <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
              {loading ? (
                <div className="flex h-72 items-center justify-center text-sm text-zinc-500">
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                  Loading tickets
                </div>
              ) : tickets.length === 0 ? (
                <div className="flex h-72 items-center justify-center text-sm text-zinc-500">
                  No matching tickets
                </div>
              ) : (
                <ul className="divide-y divide-zinc-100">
                  {tickets.map((ticket) => (
                    <li key={ticket.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(ticket.id)}
                        className={`grid w-full gap-3 px-4 py-4 text-left transition hover:bg-zinc-50 md:grid-cols-[1fr_130px_120px] ${
                          selectedTicket?.id === ticket.id ? "bg-teal-50/70" : "bg-white"
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs text-zinc-500">
                              {ticket.id}
                            </span>
                            <span
                              className={`rounded border px-2 py-0.5 text-xs font-medium capitalize ${priorityStyles[ticket.priority]}`}
                            >
                              {ticket.priority}
                            </span>
                          </span>
                          <span className="mt-2 block truncate text-base font-medium text-zinc-950">
                            {ticket.title}
                          </span>
                          <span className="mt-1 block truncate text-sm text-zinc-600">
                            {ticket.customer} · {ticket.summary}
                          </span>
                        </span>
                        <span className="flex items-center gap-2 text-sm text-zinc-600">
                          <UserRound className="size-4" aria-hidden="true" />
                          {ticket.assigneeId ?? "Unassigned"}
                        </span>
                        <span className="text-sm capitalize text-zinc-600">
                          {ticket.status}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            {selectedTicket ? (
              <section className="rounded-md border border-zinc-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-zinc-500">
                      {selectedTicket.id}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold tracking-normal">
                      {selectedTicket.title}
                    </h2>
                  </div>
                  <span
                    className={`shrink-0 rounded border px-2 py-1 text-xs font-medium capitalize ${priorityStyles[selectedTicket.priority]}`}
                  >
                    {selectedTicket.priority}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-700">
                  {selectedTicket.summary}
                </p>
                <div className="mt-4 space-y-2 text-sm text-zinc-700">
                  <p className="flex items-center gap-2">
                    <UserRound className="size-4 text-zinc-500" aria-hidden="true" />
                    {selectedTicket.customer}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="size-4 text-zinc-500" aria-hidden="true" />
                    {selectedTicket.email}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {TICKET_STATUSES.map((item) => {
                    const Icon = statusIcons[item];

                    return (
                      <button
                        key={item}
                        type="button"
                        disabled={saving || selectedTicket.status === item}
                        onClick={() => void updateStatus(selectedTicket, item)}
                        className="flex h-9 items-center gap-2 rounded-md border border-zinc-200 px-3 text-sm capitalize transition hover:border-zinc-400 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500"
                      >
                        <Icon className="size-4" aria-hidden="true" />
                        {item}
                      </button>
                    );
                  })}
                </div>
                {selectedTicket.notes.length > 0 ? (
                  <div className="mt-4 border-t border-zinc-100 pt-4">
                    <p className="text-sm font-medium">Notes</p>
                    <ul className="mt-2 space-y-2">
                      {selectedTicket.notes.map((note) => (
                        <li
                          key={note}
                          className="rounded-md bg-zinc-50 p-2 text-sm text-zinc-700"
                        >
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </section>
            ) : null}

            <form
              onSubmit={(event) => void createNewTicket(event)}
              className="rounded-md border border-zinc-200 bg-white p-4"
            >
              <div className="mb-3 flex items-center gap-2">
                <Plus className="size-4" aria-hidden="true" />
                <h2 className="text-base font-semibold">New ticket</h2>
              </div>
              <div className="space-y-3">
                <input
                  required
                  minLength={3}
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder="Title"
                  className="h-10 w-full rounded-md border border-zinc-200 px-3 text-sm outline-none transition focus:border-teal-700"
                />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <input
                    required
                    minLength={2}
                    value={form.customer}
                    onChange={(event) =>
                      setForm({ ...form, customer: event.target.value })
                    }
                    placeholder="Customer"
                    className="h-10 w-full rounded-md border border-zinc-200 px-3 text-sm outline-none transition focus:border-teal-700"
                  />
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    placeholder="Email"
                    className="h-10 w-full rounded-md border border-zinc-200 px-3 text-sm outline-none transition focus:border-teal-700"
                  />
                </div>
                <textarea
                  required
                  minLength={8}
                  value={form.summary}
                  onChange={(event) =>
                    setForm({ ...form, summary: event.target.value })
                  }
                  placeholder="Summary"
                  rows={4}
                  className="w-full resize-none rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none transition focus:border-teal-700"
                />
                <div className="grid grid-cols-[130px_1fr] gap-3">
                  <select
                    value={form.priority}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        priority: event.target.value as TicketPriority,
                      })
                    }
                    className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm capitalize outline-none transition focus:border-teal-700"
                  >
                    {TICKET_PRIORITIES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <input
                    value={form.tags}
                    onChange={(event) => setForm({ ...form, tags: event.target.value })}
                    placeholder="Tags"
                    className="h-10 rounded-md border border-zinc-200 px-3 text-sm outline-none transition focus:border-teal-700"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                >
                  {saving ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Send className="size-4" aria-hidden="true" />
                  )}
                  Create ticket
                </button>
              </div>
            </form>
          </aside>
        </section>
      </div>
    </main>
  );
}
