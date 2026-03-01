"use client";

import { useEffect, useRef, useState } from "react";

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

  const lastOpenedRef = useRef<string | null>(null);

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
  }, [code]);

  // 🔥 AUTO-OPEN LOGIC
  useEffect(() => {
    if (!data || !("found" in data) || !data.found) return;

    const currentTimestamp = data.created_at;

    // Only open if this is a new destination
    if (lastOpenedRef.current !== currentTimestamp) {
      lastOpenedRef.current = currentTimestamp;

      // Open in new tab
      window.open(data.destination, "_blank");
    }
  }, [data]);

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 18 }}>
      <h1>Tablet Receiver</h1>
      <p>
        Pair code: <b>{code}</b>
      </p>

      <div style={{ marginTop: 16 }}>
        Last check: {new Date(lastFetch).toLocaleTimeString()}
      </div>

      {data && "found" in data && data.found && (
        <>
          <div style={{ marginTop: 20 }}>
            <strong>Latest destination:</strong>
            <div><a
                    href={data.destination}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "block", marginTop: 12, fontWeight: 900, fontStyle: "italic", color: "blue" }}
                >{data.destination}</a>
            </div>
          </div>

          <a
            href={data.destination}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "block", marginTop: 12, fontWeight: 900 }}
          >
            Open manually
          </a>
        </>
      )}
    </main>
  );
}