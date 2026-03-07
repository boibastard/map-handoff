"use client";

import { useEffect, useMemo, useState } from "react";

type LatestResponse =
  | { ok: true; found: false }
  | {
      ok: true;
      found: true;
      created_at: string;
      label?: string;
      destination: string; // href URL
      destination_text: string; // display text
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

  // load last-opened timestamp for this code
  useEffect(() => {
    const saved = localStorage.getItem(storageKey(CODE)) || "";
    setLastOpenedTs(saved);
  }, [CODE]);

  // save last-opened timestamp
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [CODE]);

  const found = !!data && "found" in data && (data as any).found === true;
  const currentTs = found ? (data as any).created_at : "";
  const isNew = found && currentTs && currentTs !== lastOpenedTs;

  function markOpened() {
    if (!found) return;
    setLastOpenedTs((data as any).created_at);
  }

  const primaryBg = isNew ? "#16a34a" : "#2563eb"; // green -> blue
  const primaryBorder = isNew ? "#0f7a34" : "#1d4ed8";
  const badgeText = isNew ? "NEW LINK" : "OPENED";

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 18, fontFamily: "system-ui" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 32, margin: 0 }}>Tablet Receiver</h1>
          <div style={{ opacity: 0.8, marginTop: 6 }}>
            Pair code: <b>{CODE}</b>
            {found && (
              <span
                style={{
                  marginLeft: 10,
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: isNew ? "#16a34a" : "#2563eb",
                  color: "white",
                  fontWeight: 900,
                  fontSize: 12,
                }}
              >
                {badgeText}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={fetchLatest}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #ccc",
              fontWeight: 900,
              cursor: "pointer",
              background: "transparent",
            }}
          >
            Refresh
          </button>

          <div style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #eee", opacity: 0.8 }}>
            Last check: {new Date(lastFetch).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Primary open link: GREEN if new, BLUE if already pressed */}
      {found && (
        <a
          href={(data as any).destination}
          target="_blank"
          rel="noopener noreferrer"
          onClick={markOpened}
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
          OPEN IN GOOGLE MAPS
        </a>
      )}

      <div style={{ marginTop: 16, padding: 16, borderRadius: 16, border: "1px solid #ddd" }}>
        {!data && <div>Loading…</div>}

        {data && "error" in data && <div style={{ color: "crimson" }}>{data.error}</div>}

        {data && "ok" in data && (data as any).found === false && (
          <div>
            No destination yet. On your iPhone, open <b>/send/{CODE}</b> and send one.
          </div>
        )}

        {found && (
          <>
          <pre style={{ fontSize: 12, overflowX: "auto" }}>
            {JSON.stringify(data, null, 2)}
            </pre> 
            <div style={{ fontSize: 16, opacity: 0.8 }}>Latest destination</div>

            <a
              href={(data as any).destination}
              target="_blank"
              rel="noopener noreferrer"
              onClick={markOpened}
              title={(data as any).destination_text || (data as any).destination}
              style={{
                display: "block",
                marginTop: 10,
                padding: "12px 14px",
                border: "1px solid #ddd",
                borderRadius: 14,
                fontSize: 18,
                fontWeight: 900,
                color: "#111",
                textDecoration: "none",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {(data as any).destination_text || (data as any).destination}
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