export function normalizeInputToDirectionsUrl(inputRaw: string) {
  const input = inputRaw.trim();

  // If user pasted a full Google Maps URL, keep it but try to convert to a directions URL when possible.
  // We’ll fall back to a generic "dir" destination query.
  if (/^https?:\/\/(www\.)?google\.[^/]+\/maps/i.test(input) || /^https?:\/\/maps\.app\.goo\.gl/i.test(input)) {
    // For short links (maps.app.goo.gl), we can’t expand without a server fetch.
    // So we just use it as a destination query string.
    return {
      destinationType: "gmaps" as const,
      destination: input,
      directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(input)}&travelmode=driving`,
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
      directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}&travelmode=driving`,
      label: "Coordinates",
    };
  }

  // Otherwise treat as address / place query
  return {
    destinationType: "address" as const,
    destination: input,
    directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(input)}&travelmode=driving`,
    label: "Address / Place",
  };
}