import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api, getUser } from "../../../lib/api";
import type { Ticket } from "../../../lib/api";
import AttachmentPanel from "../components/AttachmentPanel";

type Category = { id: number; name: string };
type Comment = {
  id: number;
  content: string;
  user_name: string;
  role: string;
  created_at: string;
};
type Pagination = { page: number; pages: number; total: number };
const statuses = [
  "OPEN",
  "IN_PROGRESS",
  "WAITING_FOR_CUSTOMER",
  "RESOLVED",
  "CLOSED",
];
const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const label = (value: string) =>
  value === "WAITING_FOR_CUSTOMER"
    ? "Waiting for customer"
    : value.replaceAll("_", " ");

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    OPEN: "bg-cyan-50 text-cyan-700",
    IN_PROGRESS: "bg-violet-50 text-violet-700",
    WAITING_FOR_CUSTOMER: "bg-amber-50 text-amber-700",
    RESOLVED: "bg-emerald-50 text-emerald-700",
    CLOSED: "bg-slate-100 text-slate-600",
  };
  return (
    <span
      className={`inline-flex max-w-full whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold ${colors[status] ?? colors.CLOSED}`}
    >
      {label(status)}
    </span>
  );
}

function TicketDetails({
  ticket,
  comments,
  canManage,
  onClose,
  onReply,
  onStatus,
}: {
  ticket: Ticket;
  comments: Comment[];
  canManage: boolean;
  onClose: () => void;
  onReply: (event: FormEvent) => void;
  onStatus: (status: string) => void;
}) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex min-h-[460px] flex-col">
        <div className="border-b border-slate-100 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-cyan-700">
                Ticket #{ticket.id}
              </p>
              <h2 className="mt-2 text-lg font-bold text-slate-900">
                {ticket.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-xl text-slate-300 hover:text-slate-600"
            >
              ×
            </button>
          </div>
          <p className="mt-3 text-sm leading-5 text-slate-500">
            {ticket.description}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-slate-50 p-2.5">
              <p className="text-slate-400">Category</p>
              <p className="mt-1 font-semibold text-slate-700">
                {ticket.category_name}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2.5">
              <p className="text-slate-400">Assignee</p>
              <p className="mt-1 truncate font-semibold text-slate-700">
                {ticket.agent_name ?? "Unassigned"}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <StatusBadge status={ticket.status} />
            <span className="whitespace-nowrap text-xs text-slate-400">
              {ticket.priority} priority
            </span>
            {canManage && (
              <select
                value={ticket.status}
                onChange={(event) => onStatus(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-2 py-2 text-xs"
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="WAITING_FOR_CUSTOMER">
                  Waiting for customer
                </option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            )}
          </div>
          <AttachmentPanel ticketId={ticket.id} />
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {comments.length ? (
            <div className="space-y-3">
              {comments.map((item) => (
                <div key={item.id} className="rounded-xl bg-slate-50 p-3">
                  <div className="flex justify-between">
                    <p className="text-xs font-bold text-slate-700">
                      {item.user_name}
                    </p>
                    <p className="text-[10px] text-slate-400">{item.role}</p>
                  </div>
                  <p className="mt-2 text-sm leading-5 text-slate-600">
                    {item.content}
                  </p>
                  <p className="mt-2 text-[10px] text-slate-400">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 text-center">
              <span className="text-lg text-slate-300">✦</span>
              <p className="mt-2 text-sm font-semibold text-slate-600">
                Start the conversation
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Send the first reply to this ticket.
              </p>
            </div>
          )}
        </div>
        <form
          onSubmit={onReply}
          className="border-t border-slate-100 bg-slate-50/50 p-4"
        >
          <label className="text-xs font-semibold text-slate-600">
            Reply to this ticket
            <textarea
              name="comment"
              required
              placeholder="Write a clear, helpful reply..."
              className="mt-2 min-h-20 w-full resize-none rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none focus:border-cyan-400"
            />
          </label>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Replies notify participants.
            </span>
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700">
              Send reply
            </button>
          </div>
        </form>
      </div>
    </aside>
  );
}

function TicketsPage() {
  const user = getUser();
  const canManage = user?.role === "AGENT" || user?.role === "ADMIN";
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pages: 1,
    total: 0,
  });
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [error, setError] = useState("");
  async function load() {
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: "10",
        ...(search ? { search } : {}),
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
      });
      const [ticketResult, categoryResult] = await Promise.all([
        api<{ tickets: Ticket[]; pagination: Pagination }>(`/tickets?${query}`),
        api<{ categories: Category[] }>("/tickets/categories"),
      ]);
      setTickets(ticketResult.tickets);
      setPagination(ticketResult.pagination);
      setCategories(categoryResult.categories);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load tickets");
    }
  }
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 150);
    return () => window.clearTimeout(timer);
  }, [page, search, status, priority]);
  function filter(setter: (value: string) => void, value: string) {
    setter(value);
    setPage(1);
  }
  async function openTicket(ticket: Ticket) {
    try {
      const result = await api<{ ticket: Ticket; comments: Comment[] }>(
        `/tickets/${ticket.id}`,
      );
      setSelected(result.ticket);
      setComments(result.comments);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load ticket");
    }
  }
  async function claim(id: number) {
    if (!user) return;
    try {
      await api(`/tickets/${id}/assign`, {
        method: "POST",
        body: JSON.stringify({ agentId: user.id }),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to claim ticket");
    }
  }
  async function changeStatus(next: string) {
    if (!selected) return;
    try {
      await api(`/tickets/${selected.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      await load();
      setSelected({ ...selected, status: next });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update ticket");
    }
  }
  async function reply(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
    const body = new FormData(event.currentTarget as HTMLFormElement).get(
      "comment",
    );
    if (typeof body !== "string" || !body.trim()) return;
    try {
      const result = await api<{ comments: Comment[] }>(
        `/tickets/${selected.id}/comments`,
        { method: "POST", body: JSON.stringify({ content: body }) },
      );
      setComments(result.comments);
      (event.currentTarget as HTMLFormElement).reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to add reply");
    }
  }
  async function create(event: FormEvent) {
    event.preventDefault();
    try {
      await api("/tickets", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          categoryId: Number(categoryId),
          priority: "MEDIUM",
        }),
      });
      setTitle("");
      setDescription("");
      setCategoryId("");
      setShowCreate(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to create ticket");
    }
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-cyan-700">Support workspace</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Tickets
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {pagination.total}{" "}
            {user?.role === "CUSTOMER" ? "requests" : "work items"} in your
            workspace.
          </p>
        </div>
        {user?.role === "CUSTOMER" && (
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-700"
          >
            ＋ New ticket
          </button>
        )}
      </div>
      {error && (
        <div className="mt-5 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}
      <div className="mt-7 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <input
          value={search}
          onChange={(event) => filter(setSearch, event.target.value)}
          placeholder="Search tickets..."
          className="min-w-[220px] flex-1 rounded-lg bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-200"
        />
        <select
          value={status}
          onChange={(event) => filter(setStatus, event.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">All status</option>
          {statuses.map((value) => (
            <option key={value} value={value}>
              {label(value)}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(event) => filter(setPriority, event.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">All priority</option>
          {priorities.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </div>
      <div
        className={`mt-5 grid gap-5 ${selected ? "xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]" : "grid-cols-1"}`}
      >
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="hidden grid-cols-[minmax(0,1fr)_130px_100px_130px] gap-4 border-b border-slate-100 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 sm:grid">
            <span>Ticket</span>
            <span>Status</span>
            <span>Priority</span>
            <span>Assignee</span>
          </div>
          <div className="divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="grid gap-3 px-5 py-4 transition hover:bg-slate-50 sm:grid-cols-[minmax(0,1fr)_130px_100px_130px] sm:items-center"
              >
                <button
                  onClick={() => void openTicket(ticket)}
                  className="min-w-0 text-left"
                >
                  <p className="truncate text-sm font-bold text-slate-800">
                    {ticket.title}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-400">
                    #{ticket.id} · {ticket.category_name}
                  </p>
                </button>
                <StatusBadge status={ticket.status} />
                <p
                  className={`text-xs font-bold ${ticket.priority === "URGENT" ? "text-rose-600" : "text-slate-500"}`}
                >
                  {ticket.priority}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {ticket.agent_name ?? "Unassigned"}
                  {!ticket.agent_name && canManage && (
                    <button
                      onClick={() => void claim(ticket.id)}
                      className="ml-2 font-bold text-cyan-700"
                    >
                      Claim
                    </button>
                  )}
                </p>
              </div>
            ))}
            {tickets.length === 0 && (
              <div className="px-6 py-14 text-center">
                <p className="font-semibold text-slate-700">No tickets found</p>
                <p className="mt-1 text-sm text-slate-400">
                  Try changing your filters.
                </p>
              </div>
            )}
          </div>
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
              <p className="text-xs text-slate-400">
                Page {pagination.page} of {pagination.pages}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((value) => value - 1)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={page >= pagination.pages}
                  onClick={() => setPage((value) => value + 1)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
        {selected && (
          <TicketDetails
            ticket={selected}
            comments={comments}
            canManage={Boolean(canManage)}
            onClose={() => setSelected(null)}
            onReply={reply}
            onStatus={changeStatus}
          />
        )}
      </div>
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <form
            onSubmit={create}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Create a ticket
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Tell us what you need help with.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="text-xl text-slate-300"
              >
                ×
              </button>
            </div>
            <input
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What do you need help with?"
              className="mt-6 w-full rounded-lg border border-slate-200 p-3 text-sm"
            />
            <textarea
              required
              minLength={10}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the issue in detail..."
              className="mt-3 min-h-28 w-full resize-none rounded-lg border border-slate-200 p-3 text-sm"
            />
            <select
              required
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="mt-3 w-full rounded-lg border border-slate-200 p-3 text-sm"
            >
              <option value="">Choose a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500"
              >
                Cancel
              </button>
              <button className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-bold text-white">
                Create ticket
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default TicketsPage;
