"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SendClient({ code }: { code: string }) {
  const searchParams = useSearchParams();
  const prefill = searchParams.get("input") || "";

  const cleanCode = code?.trim() || "";
  const hasCode = cleanCode.length > 0;

  const [input, setInput] = useState(prefill || "");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");

  // useEffect(() => {
  //   if (prefill) setInput(prefill);
  // }, [prefill]);

  function getCurrentLocation(): Promise<{
    originLat: number | null;
    originLng: number | null;
    originAccuracy: number | null;
  }> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({
          originLat: null,
          originLng: null,
          originAccuracy: null,
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            originLat: position.coords.latitude,
            originLng: position.coords.longitude,
            originAccuracy: position.coords.accuracy,
          });
        },
        () => {
          // Still allow the destination to send if GPS permission fails.
          resolve({
            originLat: null,
            originLng: null,
            originAccuracy: null,
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        }
      );
    });
  }

  async function onSend() {
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

    try {
      setStatus("sending");

      const location = await getCurrentLocation();

      const res = await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          input,
          ...location,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to send");
      }

      setStatus("sent");

      if (location.originLat !== null) {
        setMsg("Destination sent successfully with origin location.");
      } else {
        setMsg("Destination sent, but origin location was unavailable.");
      }

      setInput("");
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Something went wrong.";

      setStatus("error");
      setMsg(message);
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
          <div className="panel" style={{ marginTop: 14 }}>
            {msg}
          </div>
        )}
      </div>
    </main>
  );
}