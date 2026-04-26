export default async function SentPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; dest?: string }>;
}) {
  const params = await searchParams;

  const code = (params.code || "").toUpperCase();
  const dest = params.dest || "";

  return (
    <main className="app-shell">
      <div className="app-card">
        <div className="app-header">
          <div className="app-check">✓</div>

          <div>
            <div className="app-title">Destination Sent</div>
            <div className="app-subtitle">
              Pair code: <b>{code || "—"}</b>
            </div>
          </div>
        </div>

        {dest && (
          <div
            className="destination-link"
            title={dest}
            style={{ background: "rgba(0,0,0,0.02)" }}
          >
            {dest}
          </div>
        )}

        <div className="mt-14" style={{ display: "grid", gap: 10 }}>
          <a href={`/${encodeURIComponent(code)}`} className="button-link button-green">
            Open Tablet Page
          </a>

          <a href={`/send/${encodeURIComponent(code)}`} className="button-link">
            Send Another Destination
          </a>
        </div>
      </div>
    </main>
  );
}