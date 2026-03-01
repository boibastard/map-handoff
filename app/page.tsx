"use client";

import { useMemo, useState } from "react";

const PRESET_CODES = ["NAV1", "DTF1", "MAPS", "CHET", "TEST"];

function sanitizeCode(raw: string) {
  // uppercase, keep letters/numbers only, limit length
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 12);
}

export default function Home() {
  const [preset, setPreset] = useState<string>(PRESET_CODES[0]);
  const [custom, setCustom] = useState<string>("");

  const code = useMemo(() => {
    const c = sanitizeCode(custom);
    return c.length ? c : preset;
  }, [custom, preset]);

  const sendHref = `/send/${code}`;
  const openHref = `/open/${code}`; // this assumes you added /[code] -> redirect to /open/[code]

  return (
    <main
      style={{
        maxWidth: 920,
        margin: "0 auto",
        padding: 18,
        fontFamily: "system-ui",
      }}
    >
      <header style={{ padding: "10px 0 14px" }}>
        <h1 style={{ fontSize: 36, margin: 0, letterSpacing: -0.5 }}>
          Maps Handoff
        </h1>
        <p style={{ marginTop: 8, opacity: 0.8, fontSize: 16, lineHeight: 1.5 }}>
          Send a destination from your iPhone → open it quickly on your Android tablet.
          Great for delivery / dispatch workflows.
        </p>
      </header>

      <section
        style={{
          border: "1px solid #ddd",
          borderRadius: 18,
          padding: 16,
          marginTop: 10,
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: 20 }}>How it works</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 12,
          }}
        >
          <div style={{ border: "1px solid #eee", borderRadius: 16, padding: 14 }}>
            <div style={{ fontWeight: 900, fontSize: 16 }}>1) Send (iPhone)</div>
            <div style={{ opacity: 0.85, marginTop: 6, lineHeight: 1.5 }}>
              Open the Send page, paste an address / coordinates / Google Maps link,
              then tap Send. The tablet will see it immediately.
            </div>
          </div>

          <div style={{ border: "1px solid #eee", borderRadius: 16, padding: 14 }}>
            <div style={{ fontWeight: 900, fontSize: 16 }}>2) Open (Android tablet)</div>
            <div style={{ opacity: 0.85, marginTop: 6, lineHeight: 1.5 }}>
              Keep the Open page on your tablet. When a new destination arrives,
              tap the green link to open Google Maps.
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          border: "1px solid #ddd",
          borderRadius: 18,
          padding: 16,
          marginTop: 14,
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: 20 }}>Choose your Pair Code</h2>
        <p style={{ marginTop: 6, opacity: 0.8, lineHeight: 1.5 }}>
          Your iPhone and tablet must use the same Pair Code. Pick one below.
        </p>

        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "1fr",
            marginTop: 12,
          }}
        >
          <div>
            <label style={{ display: "block", fontWeight: 800, marginBottom: 6 }}>
              Preset Pair Codes
            </label>
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value)}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 14,
                border: "1px solid #ccc",
                fontSize: 16,
              }}
            >
              {PRESET_CODES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <div style={{ marginTop: 6, fontSize: 13, opacity: 0.7 }}>
              Tip: You can type a custom code below to override presets.
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 800, marginBottom: 6 }}>
              Custom Pair Code (letters/numbers)
            </label>
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Example: DOORDASH1"
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 14,
                border: "1px solid #ccc",
                fontSize: 16,
              }}
            />
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            padding: 14,
            borderRadius: 16,
            border: "1px solid #eee",
            background: "rgba(0,0,0,0.02)",
          }}
        >
          <div style={{ fontSize: 14, opacity: 0.8 }}>Selected Pair Code</div>
          <div style={{ fontSize: 24, fontWeight: 950, marginTop: 4 }}>{code}</div>
        </div>

        <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
          {/* Send button */}
          <a
            href={sendHref}
            style={{
              display: "block",
              textAlign: "center",
              padding: "14px 16px",
              borderRadius: 16,
              textDecoration: "none",
              fontSize: 18,
              fontWeight: 950,
              border: "2px solid #111",
              color: "#111",
              background: "#fff",
            }}
          >
            Go to SEND page ({sendHref})
          </a>

          {/* Open link helper */}
          <div
            style={{
              border: "1px solid #eee",
              borderRadius: 16,
              padding: 14,
            }}
          >
            <div style={{ fontWeight: 900 }}>Open on the tablet</div>
            <div style={{ opacity: 0.8, marginTop: 6, lineHeight: 1.5 }}>
              On your tablet, open:
            </div>

            <a
              href={openHref}
              style={{
                display: "block",
                marginTop: 10,
                padding: "12px 14px",
                borderRadius: 14,
                border: "1px solid #ddd",
                textDecoration: "none",
                fontWeight: 900,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                color: "#111",
              }}
              title={openHref}
            >
              {openHref}
            </a>

            <div style={{ marginTop: 8, fontSize: 13, opacity: 0.7 }}>
              The tablet code must match the Send page code.
            </div>
          </div>
        </div>
      </section>

      <footer style={{ marginTop: 16, opacity: 0.7, fontSize: 13 }}>
        Pro tip: Add the Open page to your tablet Home Screen for one-tap access.
      </footer>
    </main>
  );
}