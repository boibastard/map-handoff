import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { unshortenUrl } from "@/lib/unshorten";

function extractNavigationQuery(input: string) {
  try {
    const url = new URL(input);

    const q =
      url.searchParams.get("q") ||
      url.searchParams.get("query") ||
      url.searchParams.get("destination");

    if (q) return decodeURIComponent(q);

    const searchPathMatch = url.pathname.match(
      /\/maps\/search\/(-?\d+(?:\.\d+)?),\s*\+?(-?\d+(?:\.\d+)?)/i
    );

    if (searchPathMatch) {
      return `${searchPathMatch[1]},${searchPathMatch[2]}`;
    }

    const atMatch = input.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);

    if (atMatch) {
      return `${atMatch[1]},${atMatch[2]}`;
    }

    const placeMatch = url.pathname.match(/\/maps\/place\/([^/]+)/i);

    if (placeMatch?.[1]) {
      return decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
    }

    return input;
  } catch {
    return input;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = String(searchParams.get("code") || "").trim().toUpperCase();

  if (!code) {
    return NextResponse.json({ ok: false, error: "Missing code" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("nav_messages")
    .select("code,destination,created_at,label,destination_type")
    .eq("code", code)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { ok: false, error: "Could not fetch destination" },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json({ ok: true, found: false, code });
  }

  let destination = String(data.destination || "").trim();

  if (/^https?:\/\/maps\.app\.goo\.gl\//i.test(destination)) {
    try {
      destination = await unshortenUrl(destination);
    } catch {
      // keep original if unshorten fails
    }
  }

  const navigationQuery = extractNavigationQuery(destination);

  return NextResponse.json({
    ok: true,
    found: true,
    code,
    destination,
    navigation_query: navigationQuery,
    created_at: data.created_at,
    maps_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(navigationQuery)}`,
    web_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      navigationQuery
    )}`,
  });
}