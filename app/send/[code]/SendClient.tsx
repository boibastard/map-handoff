"use client";

import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

type Origin = {
  origin_lat: number;
  origin_lng: number;
  origin_accuracy: number;
};

function getCurrentOrigin(): Promise<Origin | null> {
  return new Promise((resolve) => {
    // Also bound the wait when a browser leaves the permission prompt open.
    const timer = setTimeout(() => resolve(null), 5000);
    const finish = (origin: Origin | null) => {
      clearTimeout(timer);
      resolve(origin);
    };

    try {
      if (!navigator.geolocation) {
        finish(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        ({ coords }) => finish({
          origin_lat: coords.latitude,
          origin_lng: coords.longitude,
          origin_accuracy: coords.accuracy,
        }),
        () => finish(null),
        { timeout: 5000, maximumAge: 0 },
      );
    } catch {
      finish(null);
    }
  });
}

export default function SendClient({ code }: { code: string }) {
  const searchParams = useSearchParams();
  const prefill = searchParams.get("input") || "";

  const cleanCode = code?.trim() || "";
  const hasCode = cleanCode.length > 0;

  const [input, setInput] = useState(prefill || "");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");
  const sending = useRef(false);

  // useEffect(() => {
  //   if (prefill) setInput(prefill);
  // }, [prefill]);

  async function onSend() {
    if (sending.current) return;
    setMsg("");



    if(!hasCode) {
      setStatus("error");
      setMsg("Pair code required before sending.");
      return;
    }

    if(!input.trim()) {
      setStatus("error");
      setMsg("Please enter destination first.");
      return;
    } 

    sending.current = true;
    setStatus("sending");
    setMsg("Getting current location...");

    try {
      const origin = await getCurrentOrigin();
      setMsg("Sending destination...");
      const res = await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, input, ...origin }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to send");

      setStatus("sent");
      setMsg(data.locationSaved
        ? "Destination sent with location."
        : "Destination sent without location.");
      setInput("");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Something went wrong.";
      setStatus("error");
      setMsg(message ?? "Error");
    } finally {
      sending.current = false;
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
          disabled={status === "sending"}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste a Google Maps link, address, or coordinates"
          rows={1}
          className="textarea"
        />

        <button
          onClick={onSend}
          disabled={!input.trim() || status === "sending"}
          className={`button-link ${status === "sent" ? "button-green" : ""}`}
          style={{
            width: "100%",
            cursor:
              !hasCode || !input.trim() || status === "sending"
                ? "not-allowed"
                : "pointer",
            opacity:
              !hasCode || !input.trim() || status === "sending"
                ? 0.6
                : 1,
          }}
        >
          {status === "sending" ? "Sending..." : "Send to Tablet"}
        </button>

        

        <a href={`/${code}`} className="destination-link mt-14 ">
          Tablet Open Link: /{code}
        </a>

        {msg && (
          <div className="panel" role="status" style={{ marginTop: 14 }}>
            {msg}
          </div>
        )}
      </div>
    </main>
  );
}
