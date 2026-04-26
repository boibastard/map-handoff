import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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
    return NextResponse.json({ ok: false, error: "Could not fetch destination" }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ ok: true, found: false, code });
  }

  return NextResponse.json({
    ok: true,
    found: true,
    code,
    destination: data.destination,
    created_at: data.created_at,
    maps_url: `google.navigation:q=${encodeURIComponent(data.destination)}`,
    web_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.destination)}`,
  });
}