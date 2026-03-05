import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { unshortenUrl } from "@/lib/unshorten";

function isHttpUrl(s: string) {
  return /^https?:\/\//i.test(s);
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  const code = String(url.searchParams.get("code") || "")
    .trim()
    .toUpperCase();

  let u = String(url.searchParams.get("u") || "").trim();

  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });
  if (!u) return NextResponse.json({ error: "Missing u (map link / address / coords)" }, { status: 400 });

  // Expand Google short links if possible
  if (/^https?:\/\/maps\.app\.goo\.gl\//i.test(u)) {
    try {
      u = await unshortenUrl(u);
    } catch {
      // keep original if expansion fails
    }
  }

  const { error } = await supabase.from("nav_messages").insert({
    code,
    label: "Shortcut",
    destination: u,
    destination_type: isHttpUrl(u) ? "gmaps" : "address",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const destPreview = u.slice(0, 200);
  return NextResponse.redirect(
    new URL(`/sent?code=${encodeURIComponent(code)}&dest=${encodeURIComponent(destPreview)}`, url.origin),
    302
  );
}