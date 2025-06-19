/**
 * Constructs a full URL from a relative path using the API host.
 * This allows for easy switching between environments and future CDN integration.
 *
 * @param relativePath - The relative path (e.g., "events/xyz.png" or "/storage/checkin-photos/xyz.png")
 * @returns The full URL (e.g., "https://resonance-be.ddev.site/storage/events/xyz.png")
 */
export const getFullUrl = (relativePath: string): string => {
  // If the path is already a full URL, return it as is
  if (
    relativePath.startsWith("http://") ||
    relativePath.startsWith("https://")
  ) {
    return relativePath;
  }

  // Clean the relative path - remove any leading slashes
  const cleanPath = relativePath.startsWith("/")
    ? relativePath.substring(1)
    : relativePath;

  // Handle different path formats from the database
  let finalPath: string;

  if (cleanPath.startsWith("storage/")) {
    // Already has storage prefix (e.g., checkin photos)
    finalPath = `/${cleanPath}`;
  } else if (cleanPath.startsWith("events/")) {
    // Database format: "events/filename.jpg" -> "/storage/events/filename.jpg"
    finalPath = `/storage/${cleanPath}`;
  } else {
    // Fallback: assume it needs storage prefix
    finalPath = `/storage/${cleanPath}`;
  }

  // Always use proxy for external images to avoid CORS issues and ensure consistent behavior
  // This prevents the backend URL from being exposed directly to the client
  const proxyUrl = `/api/proxy-image-simple?path=${encodeURIComponent(
    finalPath
  )}`;
  return proxyUrl;
};

/**
 * Gets the base URL for the API, including the protocol.
 * This is useful for constructing full URLs for API endpoints.
 */
export const getApiBaseUrl = (): string => {
  const apiHost =
    process.env.NEXT_PUBLIC_API_HOST ||
    "resonance-app-cf7lh.ondigitalocean.app";
  return `https://${apiHost}`;
};
