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
    const res = await fetch(`/api/latest?code=${encodeURIComponent(code)}`, { cache: "no-store" });
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

  const found = (data as any)?.found === true;

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 18, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 32, marginBottom: 6 }}>Tablet Receiver</h1>
      <p style={{ opacity: 0.8, marginTop: 0 }}>
        Pair code: <b>{code}</b>
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
        <button
          onClick={fetchLatest}
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid #ccc",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Refresh now
        </button>
        <div style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #eee", opacity: 0.8 }}>
          Last check: {new Date(lastFetch).toLocaleTimeString()}
        </div>
      </div>

      <div style={{ marginTop: 16, padding: 16, borderRadius: 16, border: "1px solid #ddd" }}>
        {!data && <div>Loading…</div>}

        {data && "error" in data && <div style={{ color: "crimson" }}>{data.error}</div>}

        {data && "ok" in data && (data as any).found === false && (
          <div>
            No destination yet. On your iPhone, open <b>/send/{code}</b> and send one.
          </div>
        )}

        {found && (
          <>
            <div style={{ fontSize: 18, opacity: 0.8 }}>Latest destination</div>
            <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6 }}>
              {(data as any).destination}
            </div>
            <div style={{ opacity: 0.75, marginTop: 6 }}>
              {new Date((data as any).created_at).toLocaleString()}
            </div>

            <a
              href={(data as any).directionsUrl}
              style={{
                display: "block",
                textAlign: "center",
                marginTop: 16,
                padding: "18px 16px",
                borderRadius: 18,
                textDecoration: "none",
                fontSize: 22,
                fontWeight: 900,
                border: "2px solid #111",
              }}
            >
              OPEN GOOGLE MAPS (DRIVE)
            </a>
          </>
        )}
      </div>
    </main>
  );
}