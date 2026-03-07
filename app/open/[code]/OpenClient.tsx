"use client";

import { useEffect, useMemo, useState } from "react";

type LatestResponse =
  | { ok: true; found: false }
  | {
      ok: true;
      found: true;
      created_at: string;
      label?: string;
      destination: string;
      destination_text: string;
      destination_type: string;
    }
  | { error: string };

function storageKey(code: string) {
  return `maps_handoff_last_opened_${code}`;
}

export default function OpenClient({ code }: { code: string }) {
  const CODE = useMemo(() => code.toUpperCase(), [code]);
  const [data, setData] = useState<LatestResponse | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(Date.now());
  const [lastOpenedTs, setLastOpenedTs] = useState<string>("");

  useEffect(() => {
    const saved = localStorage.getItem(storageKey(CODE)) || "";
    setLastOpenedTs(saved);
  }, [CODE]);

  useEffect(() => {
    if (lastOpenedTs) localStorage.setItem(storageKey(CODE), lastOpenedTs);
  }, [CODE, lastOpenedTs]);

  async function fetchLatest() {
    const res = await fetch(`/api/latest?code=${encodeURIComponent(CODE)}`, { cache: "no-store" });
    const json = (await res.json()) as LatestResponse;
    setData(json);
    setLastFetch(Date.now());
  }

  useEffect(() => {
    fetchLatest();
    const t = setInterval(fetchLatest, 2500);
    return () => clearInterval(t);
  }, [CODE]);

  const found = !!data && "found" in data && (data as any).found === true;
  const currentTs = found ? (data as any).created_at : "";
  const isNew = found && currentTs && currentTs !== lastOpenedTs;

  function markOpened() {
    if (!found) return;
    setLastOpenedTs((data as any).created_at);
  }

  return (
    <main className="app-shell">
        <div className="app-card">
      <div className="row-between">
        <div>
          <div className="app-title">Tablet Receiver</div>
          <div className="page-meta">
            Pair code: <b>{CODE}</b>
            {found && (
              <span className={`badge ${isNew ? "badge-green" : "badge-blue"}`}>
                {isNew ? "NEW LINK" : "OPENED"}
              </span>
            )}
          </div>
        </div>

        <div className="row">
          <button onClick={fetchLatest} className="button-ghost">
            Refresh
          </button>

          <div className="soft-box">
            Last check: {new Date(lastFetch).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {found && (
        <a
          href={(data as any).destination}
          target="_blank"
          rel="noopener noreferrer"
          onClick={markOpened}
          className={`button-link ${isNew ? "button-green" : "button-blue"}`}
        >
          OPEN IN GOOGLE MAPS
        </a>
      )}

      <div className="panel">
        {!data && <div>Loading…</div>}

        {data && "error" in data && <div style={{ color: "crimson" }}>{data.error}</div>}

        {data && "ok" in data && (data as any).found === false && (
          <div>
            No destination yet. On your iPhone, open <b>/send/{CODE}</b> and send one.
          </div>
        )}

        {found && (
          <>
            <div style={{ fontSize: 16, opacity: 0.8 }}>Latest destination</div>

            <a
              href={(data as any).destination}
              target="_blank"
              rel="noopener noreferrer"
              onClick={markOpened}
              title={(data as any).destination_text || (data as any).destination}
              className="destination-link"
            >
              {(data as any).destination_text || (data as any).destination}
            </a>

            <div className="timestamp">
              {new Date((data as any).created_at).toLocaleString()}
            </div>
          </>
        )}
      </div>
      </div>
    </main>
  );
}