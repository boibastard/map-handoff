"use client";

import { useEffect, useState } from "react";

type LatestResponse =
  | { ok: true; found: false }
  | {
      ok: true;
      found: true;
      created_at: string;
      label?: string;
      destination: string;
      destination_type: string;
      directionsUrl: string;
    }
  | { error: string };

export default function OpenClient({ code }: { code: string }) {
  const [data, setData] = useState<LatestResponse | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(Date.now());

  async function fetchLatest() {
    const res = await fetch(`/api/latest?code=${encodeURIComponent(code)}`, {
      cache: "no-store",
    });
    const json = (await res.json()) as LatestResponse;
    setData(json);
    setLastFetch(Date.now());
  }

  useEffect(() => {
    fetchLatest();
    const t = setInterval(fetchLatest, 2500);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const found = !!data && "found" in data && (data as any).found === true;

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 18, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 32, marginBottom: 6 }}>Tablet Receiver (pair code): <b>{code}</b>
        <p style={{ opacity: 0.85, margin: 0 }}>
          
        </p></h1>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>

        <div style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #eee", opacity: 0.8 }}>
          Last check: {new Date(lastFetch).toLocaleTimeString()}
        </div>

        <button
          onClick={fetchLatest}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #ccc",
            fontWeight: 700,
            cursor: "pointer",
            background: "transparent",
          }}
        >
          Refresh
        </button>
      </div>

      {/* ✅ "Open manually" moved to the top + green active button look */}
      {found && (
        <a
          href={(data as any).destination}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            marginTop: 14,
            padding: "14px 16px",
            borderRadius: 16,
            textDecoration: "none",
            fontSize: 18,
            fontWeight: 900,
            textAlign: "center",
            border: "2px solid #0f7a34",
            background: "#16a34a", // green
            color: "white",
            boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
          }}
        >
          OPEN IN GOOGLE MAPS
        </a>
      )}

      <div style={{ marginTop: 16, padding: 16, borderRadius: 16, border: "1px solid #ddd" }}>
        {!data && <div>Loading…</div>}

        {data && "error" in data && <div style={{ color: "crimson" }}>{data.error}</div>}

        {data && "ok" in data && (data as any).found === false && (
          <div>
            No destination yet. On your iPhone, open <b>/send/{code}</b> and send one.
          </div>
        )}

        {/* ✅ Destination becomes an anchor text, truncated */}
        {found && (
          <>
            <div style={{ fontSize: 16, opacity: 0.8 }}>Latest destination</div>

            <a
              href={(data as any).destination}
              target="_blank"
              rel="noopener noreferrer"
              title={(data as any).destination}
              style={{
                display: "block",
                marginTop: 10,
                padding: "12px 14px",
                border: "1px solid #ddd",
                borderRadius: 14,
                fontSize: 18,
                fontWeight: 800,
                color: "#111",
                textDecoration: "none",

                // ✅ overflow handling
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {(data as any).destination}
            </a>

            <div style={{ opacity: 0.75, marginTop: 8 }}>
              {new Date((data as any).created_at).toLocaleString()}
            </div>
          </>
        )}
      </div>
    </main>
  );
}