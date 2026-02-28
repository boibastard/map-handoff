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

    const { error } = await supabase.from("nav_messages").insert({
      code,
      label: norm.label,
      destination: norm.destination,
      destination_type: norm.destinationType,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, code, ...norm });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}