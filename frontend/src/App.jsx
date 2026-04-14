import { useEffect, useMemo, useState } from "react";

function getApiBase() {
  // Works both locally and on EC2 because it uses the current host.
  return `${location.protocol}//${location.hostname}:8080`;
}

export default function App() {
  const apiBase = useMemo(() => getApiBase(), []);
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function loadNotes() {
    setError("");
    const res = await fetch(`${apiBase}/notes`);
    if (!res.ok) throw new Error(`Failed to load notes (${res.status})`);
    const data = await res.json();
    setNotes(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    loadNotes().catch((e) => setError(String(e?.message || e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    setBusy(true);
    setError("");
    try {
      const res = await fetch(`${apiBase}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed })
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Failed to add note (${res.status}): ${msg}`);
      }
      setText("");
      await loadNotes();
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.h1}>Practice Full-Stack</h1>
        <p style={styles.p}>
          Frontend is static on port 80/3000, backend API is on port 8080, and
          notes are persisted in Postgres.
        </p>

        <form onSubmit={onSubmit} style={styles.form}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a note..."
            style={styles.input}
            disabled={busy}
          />
          <button style={styles.button} disabled={busy || !text.trim()}>
            {busy ? "Adding..." : "Add"}
          </button>
        </form>

        {error ? <div style={styles.error}>{error}</div> : null}

        <div style={styles.meta}>
          API base: <code>{apiBase}</code>
        </div>

        <ul style={styles.list}>
          {notes.map((n) => (
            <li key={n.id} style={styles.item}>
              <div style={styles.text}>{n.text}</div>
              <div style={styles.time}>
                {n.created_at ? new Date(n.created_at).toLocaleString() : ""}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background:
      "radial-gradient(1200px 700px at 30% 20%, #d7f7ff 0%, rgba(215,247,255,0) 60%), radial-gradient(1000px 600px at 80% 70%, #fff0d6 0%, rgba(255,240,214,0) 60%), #fbfbfb",
    padding: 24,
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, "Noto Sans", "Liberation Sans", sans-serif'
  },
  card: {
    width: "min(800px, 100%)",
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 16,
    boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
    padding: 24
  },
  h1: { margin: "0 0 6px 0", letterSpacing: "-0.02em" },
  p: { margin: "0 0 18px 0", color: "rgba(0,0,0,0.7)" },
  form: { display: "flex", gap: 10, marginBottom: 12 },
  input: {
    flex: 1,
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.15)",
    outline: "none"
  },
  button: {
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.15)",
    background: "#111",
    color: "white",
    cursor: "pointer"
  },
  error: {
    marginTop: 8,
    padding: 10,
    borderRadius: 12,
    background: "rgba(255,0,0,0.06)",
    border: "1px solid rgba(255,0,0,0.15)",
    color: "#8a1111"
  },
  meta: {
    marginTop: 10,
    fontSize: 12,
    color: "rgba(0,0,0,0.65)"
  },
  list: { listStyle: "none", padding: 0, margin: "18px 0 0 0" },
  item: {
    borderTop: "1px solid rgba(0,0,0,0.08)",
    padding: "12px 0"
  },
  text: { whiteSpace: "pre-wrap" },
  time: { marginTop: 4, fontSize: 12, color: "rgba(0,0,0,0.55)" }
};

