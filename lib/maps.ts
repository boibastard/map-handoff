export function normalizeInputToDirectionsUrl(inputRaw: string) {
  const input = inputRaw.trim();

  // If user pasted a Google Maps URL (including short links), use it as a destination query.
  // This avoids needing to expand/resolve the URL.
  if (
    /^https?:\/\/(www\.)?google\.[^/]+\/maps/i.test(input) ||
    /^https?:\/\/maps\.app\.goo\.gl/i.test(input)
  ) {
    return {
      destinationType: "gmaps" as const,
      destination: input,
      // Android-friendly directions URL
      directionsUrl: `https://maps.google.com/?daddr=${encodeURIComponent(input)}`,
      label: "Google Maps link",
    };
  }

  // Coordinates "lat,lng"
  const coordMatch = input.match(/^\s*(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)\s*$/);
  if (coordMatch) {
    const lat = coordMatch[1];
    const lng = coordMatch[3];
    const dest = `${lat},${lng}`;
    return {
      destinationType: "coords" as const,
      destination: dest,
      directionsUrl: `https://maps.google.com/?daddr=${encodeURIComponent(dest)}`,
      label: "Coordinates",
    };
  }

  // Otherwise treat as address / place query
  return {
    destinationType: "address" as const,
    destination: input,
    directionsUrl: `https://maps.google.com/?daddr=${encodeURIComponent(input)}`,
    label: "Address / Place",
  };
}