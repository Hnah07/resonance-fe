/**
 * Constructs a full URL from a relative path using the API host.
 * This allows for easy switching between environments and future CDN integration.
 *
 * @param relativePath - The relative path (e.g., "events/xyz.png" or "/storage/checkin-photos/xyz.png")
 * @returns The full URL (e.g., "https://resonance-be.ddev.site/storage/events/xyz.png")
 */
export const getFullUrl = (relativePath: string): string => {
  const apiHost =
    process.env.NEXT_PUBLIC_API_HOST ||
    "resonance-app-cf7lh.ondigitalocean.app";

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

  // Check if we're in production or on mobile and use proxy for better compatibility
  const isMobile =
    typeof window !== "undefined" &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  const isProduction = process.env.NODE_ENV === "production";

  // Use proxy for mobile devices and in production to avoid CORS issues
  if (isMobile || isProduction) {
    // Only encode the relative path, not the full URL
    const proxyUrl = `/api/proxy-image-simple?path=${encodeURIComponent(
      finalPath
    )}`;
    return proxyUrl;
  }

  const fullUrl = `https://${apiHost}${finalPath}`;
  return fullUrl;
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
