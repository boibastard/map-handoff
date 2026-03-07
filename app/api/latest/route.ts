import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { normalizeInputToDirectionsUrl } from "@/lib/maps";
import { unshortenUrl } from "@/lib/unshorten";

function extractDestinationDisplay(input: string) {
  try {
    // Plain coordinates like "27.4956,-81.4409"
    const coordOnly = input.match(/^\s*(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)\s*$/);
    if (coordOnly) {
      return `${coordOnly[1]}, ${coordOnly[3]}`;
    }

    const url = new URL(input);

    // Try common Google Maps query params
    const q =
      url.searchParams.get("q") ||
      url.searchParams.get("query") ||
      url.searchParams.get("destination");

    if (q) return decodeURIComponent(q);

    // Try extracting place name from /maps/place/...
    const placeMatch = url.pathname.match(/\/maps\/place\/([^/]+)/i);
    if (placeMatch?.[1]) {
      return decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
    }

    // Try extracting coordinates from @lat,lng
    const atMatch = input.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) return `${atMatch[1]}, ${atMatch[2]}`;

    // Fallback to hostname/path if it's still a URL
    return input;
  } catch {
    // Not a URL, probably plain address text
    return input;
  }
}

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

  let destination = String(row.destination || "").trim();

  // Expand short links first
  if (/^https?:\/\/maps\.app\.goo\.gl\//i.test(destination)) {
    try {
      destination = await unshortenUrl(destination);
    } catch {
      // keep original if expansion fails
    }
  }

  const norm = normalizeInputToDirectionsUrl(destination);
  const destination_text = extractDestinationDisplay(destination);

  return NextResponse.json({
    ok: true,
    found: true,
    code,
    created_at: row.created_at,
    label: row.label,
    destination: norm.directionsUrl, // clickable href
    destination_text, // readable display text
    destination_type: row.destination_type,
  });
}