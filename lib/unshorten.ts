export async function unshortenUrl(url: string): Promise<string> {
  // Follow redirects and return the final resolved URL
  const res = await fetch(url, {
    method: "GET",
    redirect: "follow",
    // Some shorteners behave better with a browser-ish UA
    headers: { "user-agent": "Mozilla/5.0" },
    // Avoid caching weirdness
    cache: "no-store",
  });

  return res.url || url;
}