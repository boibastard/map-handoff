"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SendClient({ code }: { code: string }) {
  const searchParams = useSearchParams();
  const prefill = searchParams.get("input") || "";

  const [input, setInput] = useState(prefill);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (prefill) setInput(prefill);
  }, [prefill]);

  async function onSend() {
    setStatus("sending");
    setMsg("");

    try {
      const res = await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, input }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to send");

      setStatus("sent");
      setMsg("Destination sent successfully.");
      setInput("");
    } catch (e: any) {
      setStatus("error");
      setMsg(e?.message ?? "Error");
    }
  }

  return (
    <main className="app-shell">
      <div className="app-card">
        <div className="app-header">
          <div className="app-check">↑</div>

          <div>
            <div className="app-title">Send Destination</div>
            <div className="app-subtitle">
              Pair code: <b>{code}</b>
            </div>
          </div>
        </div>

        <label className="label">Destination</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste a Google Maps link, address, or coordinates"
          rows={1}
          className="textarea"
        />

        <button
          onClick={onSend}
          disabled={!input.trim() || status === "sending"}
          className={`button-link ${status === "sent" ? "button-green" : ""}`}
          style={{ width: "100%", cursor: "pointer" }}
        >
          {status === "sending" ? "Sending..." : "Send to Tablet"}
        </button>

        

        <a href={`/${code}`} className="destination-link mt-14 ">
          Tablet Open Link: /{code}
        </a>

        {msg && (
          <div className="panel" style={{ marginTop: 14 }}>
            {msg}
          </div>
        )}
      </div>
    </main>
  );
}