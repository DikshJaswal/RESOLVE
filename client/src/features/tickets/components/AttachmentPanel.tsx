import { useEffect, useState } from "react";
import { api, getUser } from "../../../lib/api";

type Attachment = {
  id: number;
  file_name: string;
  file_url: string;
  file_size: number;
  uploaded_by: number;
  uploaded_by_name?: string;
};

function size(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AttachmentPanel({ ticketId }: { ticketId: number }) {
  const [items, setItems] = useState<Attachment[]>([]);
  const [priority, setPriority] = useState("MEDIUM");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const user = getUser();

  async function load() {
    try {
      const result = await api<{ attachments: Attachment[] }>(
        `/tickets/${ticketId}/attachments`,
      );
      setItems(result.attachments);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load attachments");
    }
  }
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
      void api<{ ticket: { priority: string } }>(`/tickets/${ticketId}`)
        .then((result) => setPriority(result.ticket.priority))
        .catch(() => undefined);
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  async function updatePriority(value: string) {
    try {
      await api(`/tickets/${ticketId}/priority`, {
        method: "PATCH",
        body: JSON.stringify({ priority: value }),
      });
      setPriority(value);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update priority");
    }
  }

  async function upload(file: File) {
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      await api(`/tickets/${ticketId}/attachments`, { method: "POST", body });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to upload file");
    } finally {
      setBusy(false);
    }
  }
  async function remove(id: number) {
    try {
      await api(`/tickets/${ticketId}/attachments/${id}`, { method: "DELETE" });
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to delete file");
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
      <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-3">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Priority
        </p>
        {user?.role === "AGENT" || user?.role === "ADMIN" ? (
          <select
            value={priority}
            onChange={(event) => void updatePriority(event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold"
          >
            <option>LOW</option>
            <option>MEDIUM</option>
            <option>HIGH</option>
            <option>URGENT</option>
          </select>
        ) : (
          <span className="text-xs font-bold text-slate-700">{priority}</span>
        )}
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Attachments
        </p>
        <label className="cursor-pointer rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-cyan-700 shadow-sm ring-1 ring-slate-200 hover:bg-cyan-50">
          {busy ? "Uploading…" : "Add file"}
          <input
            type="file"
            className="hidden"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
              event.currentTarget.value = "";
            }}
          />
        </label>
      </div>
      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
      {items.length ? (
        <div className="mt-2 space-y-1.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2 rounded-lg bg-white px-2.5 py-2 text-xs"
            >
              <a
                href={item.file_url}
                target="_blank"
                rel="noreferrer"
                className="min-w-0 truncate font-semibold text-cyan-700 hover:underline"
              >
                {item.file_name}
              </a>
              <span className="shrink-0 text-slate-400">
                {size(item.file_size)}
                {item.uploaded_by === user?.id && (
                  <button
                    type="button"
                    onClick={() => void remove(item.id)}
                    className="ml-2 text-rose-500 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-xs text-slate-400">No files attached yet.</p>
      )}
    </div>
  );
}
