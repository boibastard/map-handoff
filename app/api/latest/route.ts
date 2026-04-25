import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { normalizeInputToDirectionsUrl } from "@/lib/maps";
import { unshortenUrl } from "@/lib/unshorten";

function extractDestinationDisplay(input: string) {
  try {
    const coordOnly = input.match(
      /^\s*(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)\s*$/
    );

    if (coordOnly) {
      return `${coordOnly[1]}, ${coordOnly[3]}`;
    }

    const url = new URL(input);

    const q =
      url.searchParams.get("q") ||
      url.searchParams.get("query") ||
      url.searchParams.get("destination");

    if (q) return decodeURIComponent(q);

    const placeMatch = url.pathname.match(/\/maps\/place\/([^/]+)/i);

    if (placeMatch?.[1]) {
      return decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
    }

    const atMatch = input.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);

    if (atMatch) {
      return `${atMatch[1]}, ${atMatch[2]}`;
    }

    return input;
  } catch {
    return input;
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = String(searchParams.get("code") || "")
      .trim()
      .toUpperCase();

    if (!code) {
      return NextResponse.json(
        {
          ok: false,
          found: false,
          error: "Missing pair code.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("nav_messages")
      .select("*")
      .eq("code", code)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[api/latest] Supabase error:", error.message);

      return NextResponse.json(
        {
          ok: false,
          found: false,
          error: "Could not fetch latest destination.",
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({
        ok: true,
        found: false,
        code,
      });
    }

    let destination = String(data.destination || "").trim();

    if (!destination) {
      return NextResponse.json(
        {
          ok: false,
          found: true,
          code,
          error: "Latest destination is empty.",
        },
        { status: 422 }
      );
    }

    if (/^https?:\/\/maps\.app\.goo\.gl\//i.test(destination)) {
      try {
        destination = await unshortenUrl(destination);
      } catch (error) {
        console.warn("[api/latest] Could not unshorten URL:", error);
      }
    }

    const norm = normalizeInputToDirectionsUrl(destination);
    const destination_text = extractDestinationDisplay(destination);

    return NextResponse.json({
      ok: true,
      found: true,
      code,
      created_at: data.created_at,
      label: data.label,
      destination: norm.directionsUrl,
      destination_text,
      destination_type: data.destination_type,
    });
  } catch (error) {
    console.error("[api/latest] Unexpected error:", error);

    return NextResponse.json(
      {
        ok: false,
        found: false,
        error: "Unexpected server error.",
      },
      { status: 500 }
    );
  }
}