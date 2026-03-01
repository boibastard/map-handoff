import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { normalizeInputToDirectionsUrl } from "@/lib/maps";
import { unshortenUrl } from "@/lib/unshorten";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = String(searchParams.get("code") || "").trim().toUpperCase();

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("nav_messages")
    .select("*")
    .eq("code", code)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const row = data?.[0];
  if (!row) {
    return NextResponse.json({ ok: true, found: false });
  }

  // ✅ Expand Google Maps short links before building directionsUrl
  let destination = String(row.destination || "").trim();

  if (/^https?:\/\/maps\.app\.goo\.gl\//i.test(destination)) {
    try {
      destination = await unshortenUrl(destination);
    } catch {
      // If expansion fails, we keep the original short link.
    }
  }

  const norm = normalizeInputToDirectionsUrl(destination);

  return NextResponse.json({
    ok: true,
    found: true,
    code,
    created_at: row.created_at,
    label: row.label,
    destination,
    destination_type: row.destination_type,
    directionsUrl: norm.directionsUrl,
  });
}