import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { normalizeInputToDirectionsUrl } from "@/lib/maps";

export async function POST(req: Request) {
  try {
    
    const body = await req.json();
    const code = String(body.code || "").trim().toUpperCase();
    const input = String(body.input || "").trim();
    const originLat = Number(body.originLat);
    const originLng = Number(body.originLng);
    const originAccuracy = Number(body.originAccuracy);

    if (!code || code.length < 2) {
      return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }
    if (!input) {
      return NextResponse.json({ error: "Missing destination input" }, { status: 400 });
    }

    const norm = normalizeInputToDirectionsUrl(input);

    const { error } = await supabase.from("nav_messages").insert({
      code,
      label: norm.label,
      destination: norm.destination,
      destination_type: norm.destinationType,

      origin_lat: Number.isFinite(originLat) ? originLat : null,
      origin_lng: Number.isFinite(originLng) ? originLng : null,
      origin_accuracy: Number.isFinite(originAccuracy)
        ? originAccuracy
        : null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, code, ...norm });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}