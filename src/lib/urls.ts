/**
 * Constructs a full URL from a relative path using the API host.
 * This allows for easy switching between environments and future CDN integration.
 *
 * @param relativePath - The relative path (e.g., "events/xyz.png" or "/storage/checkin-photos/xyz.png")
 * @returns The full URL (e.g., "https://resonance-be.ddev.site/storage/events/xyz.png")
 */
export const getFullUrl = (relativePath: string): string => {
  const apiHost = process.env.NEXT_PUBLIC_API_HOST;

  if (!apiHost) {
    console.warn("NEXT_PUBLIC_API_HOST is not defined, using relative path");
    return relativePath;
  }

  // Clean the relative path - remove any leading slashes that might cause issues
  let cleanPath = relativePath;
  if (cleanPath.startsWith("/storage/")) {
    cleanPath = cleanPath.substring(1); // Remove leading slash
  }

  // Add /storage/ prefix for event images if not already present
  const path = cleanPath.startsWith("storage/")
    ? `/${cleanPath}`
    : cleanPath.startsWith("events/")
    ? `/storage/${cleanPath}`
    : cleanPath.startsWith("/")
    ? cleanPath
    : `/${cleanPath}`;

  // Check if we're in production or on mobile and use proxy for better compatibility
  const isMobile =
    typeof window !== "undefined" &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  const isProduction = process.env.NODE_ENV === "production";

  // Use proxy for mobile devices and in production to avoid CORS issues
  if (isMobile || isProduction) {
    const proxyUrl = `/api/proxy-image-simple?path=${encodeURIComponent(path)}`;
    return proxyUrl;
  }

  const fullUrl = `https://${apiHost}${path}`;
  return fullUrl;
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
