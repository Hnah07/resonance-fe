/**
 * Constructs a full URL from a relative path using the API host.
 * This allows for easy switching between environments and future CDN integration.
 *
 * @param relativePath - The relative path (e.g., "/storage/checkin-photos/xyz.png")
 * @returns The full URL (e.g., "https://resonance-be.ddev.site/storage/checkin-photos/xyz.png")
 */
export const getFullUrl = (relativePath: string): string => {
  const apiHost = process.env.NEXT_PUBLIC_API_HOST;
  if (!apiHost) {
    console.warn("NEXT_PUBLIC_API_HOST is not defined, using relative path");
    return relativePath;
  }
  return `https://${apiHost}${relativePath}`;
};

/**
 * Gets the base URL for the API, including the protocol.
 * This is useful for constructing full URLs for API endpoints.
 */
export const getApiBaseUrl = (): string => {
  const apiHost = process.env.NEXT_PUBLIC_API_HOST;
  if (!apiHost) {
    console.warn("NEXT_PUBLIC_API_HOST is not defined");
    return "";
  }
  return `https://${apiHost}`;
};
