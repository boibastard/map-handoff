export default function SentPage({
  searchParams,
}: {
  searchParams: { code?: string; dest?: string };
}) {
  const code = (searchParams.code || "").toUpperCase();
  const dest = searchParams.dest || "";

  return (
    <main
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: 18,
        fontFamily: "system-ui",
      }}
    >
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 18,
          padding: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 999,
              display: "grid",
              placeItems: "center",
              background: "#16a34a",
              color: "white",
              fontWeight: 900,
            }}
          >
            ✓
          </div>

          <div>
            <div style={{ fontSize: 22, fontWeight: 950 }}>Destination Sent</div>
            <div style={{ opacity: 0.8, marginTop: 2 }}>
              Pair code: <b>{code || "—"}</b>
            </div>
          </div>
        </div>

        {dest && (
          <div
            title={dest}
            style={{
              marginTop: 14,
              padding: "12px 14px",
              borderRadius: 14,
              border: "1px solid #eee",
              background: "rgba(0,0,0,0.02)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontWeight: 800,
            }}
          >
            {dest}
          </div>
        )}

        <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
          <a
            href={`/${encodeURIComponent(code)}`}
            style={{
              display: "block",
              textAlign: "center",
              padding: "14px 16px",
              borderRadius: 16,
              textDecoration: "none",
              fontSize: 18,
              fontWeight: 950,
              border: "2px solid #0f7a34",
              background: "#16a34a",
              color: "white",
              boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
            }}
          >
            Open Tablet Page
          </a>

          <a
            href={`/send/${encodeURIComponent(code)}`}
            style={{
              display: "block",
              textAlign: "center",
              padding: "12px 16px",
              borderRadius: 16,
              textDecoration: "none",
              fontWeight: 900,
              border: "1px solid #ddd",
              color: "#111",
              background: "white",
            }}
          >
            Send Another Destination
          </a>
        </div>
      </div>
    </main>
  );
}