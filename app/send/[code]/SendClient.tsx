"use client";

import { useState } from "react";

export default function SendClient({ code }: { code: string }) {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");

  const primaryBg =  "#16a34a"; // green -> blue
  const primaryBorder =  "#0f7a34";

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
      setMsg("Sent! Now check the tablet.");
      setInput("");
    } catch (e: any) {
      setStatus("error");
      setMsg(e?.message ?? "Error");
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
      <h1>Send Navigation</h1>
      <p>Pair code: <b>{code}</b></p>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter address, coordinates, or Google Maps link"
        rows={4}
        style={{ width: "100%", marginTop: 10 }}
      />

      <button
        onClick={onSend}
        disabled={!input.trim() || status === "sending"}
        // style={{ width: "100%", marginTop: 10 }}
        style={{
            display: "block",
            marginTop: 14,
            padding: "14px 16px",
            borderRadius: 16,
            textDecoration: "none",
            fontSize: 18,
            fontWeight: 950,
            textAlign: "center",
            border: `2px solid ${primaryBorder}`,
            background: primaryBg,
            color: "white",
            boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
          }}
      >
        {status === "sending" ? "Sending..." : "Send to Tablet"}
      </button>

      {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
    </main>
  );
}