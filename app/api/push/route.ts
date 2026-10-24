import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { normalizeInputToDirectionsUrl } from "@/lib/maps";

export async function POST(req: Request) {
  try {
    
    const body = await req.json();
    const code = String(body.code || "").trim().toUpperCase();
    const input = String(body.input || "").trim();

    if (!code || code.length < 2) {
      return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }
    if (!input) {
      return NextResponse.json({ error: "Missing destination input" }, { status: 400 });
    }

    const norm = normalizeInputToDirectionsUrl(input);
    const { origin_lat, origin_lng, origin_accuracy } = body;
    // Location is optional. Discard incomplete or invalid fixes without
    // interrupting the destination handoff (including older clients).
    const locationSaved =
      typeof origin_lat === "number" && Number.isFinite(origin_lat) &&
      origin_lat >= -90 && origin_lat <= 90 &&
      typeof origin_lng === "number" && Number.isFinite(origin_lng) &&
      origin_lng >= -180 && origin_lng <= 180 &&
      typeof origin_accuracy === "number" && Number.isFinite(origin_accuracy) &&
      origin_accuracy >= 0;
    const origin = locationSaved
      ? { origin_lat, origin_lng, origin_accuracy }
      : {};

    const { error } = await supabase.from("nav_messages").insert({
      code,
      label: norm.label,
      destination: norm.destination,
      destination_type: norm.destinationType,
      ...origin,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, code, ...norm, locationSaved });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
