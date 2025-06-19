/**
 * Constructs a full URL from a relative path using the API host.
 * This allows for easy switching between environments and future CDN integration.
 *
 * @param relativePath - The relative path (e.g., "events/xyz.png" or "/storage/checkin-photos/xyz.png")
 * @returns The full URL or proxy URL depending on the input
 */
export const getFullUrl = (relativePath: string): string => {
  // If the path is already a full URL, extract the path and use proxy
  if (
    relativePath.startsWith("http://") ||
    relativePath.startsWith("https://")
  ) {
    try {
      const url = new URL(relativePath);
      const path = url.pathname;
      // Use proxy for the extracted path
      const proxyUrl = `/api/proxy-image?path=${encodeURIComponent(path)}`;
      return proxyUrl;
    } catch (error) {
      console.error("Failed to parse URL:", relativePath, error);
      // Fallback to original path if URL parsing fails
    }
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

  // For now, let's try using the direct backend URL since the proxy is having issues
  // This will help us determine if the issue is with the proxy or the backend
  const apiHost = process.env.NEXT_PUBLIC_API_HOST;
  if (apiHost) {
    return `https://${apiHost}${finalPath}`;
  }

  // Fallback to proxy if no API host is configured
  const proxyUrl = `/api/proxy-image?path=${encodeURIComponent(finalPath)}`;
  return proxyUrl;
};

/**
 * Gets the base URL for the API, including the protocol.
 * This is useful for constructing full URLs for API endpoints.
 */
export const getApiBaseUrl = (): string => {
  const apiHost = process.env.NEXT_PUBLIC_API_HOST;
  if (!apiHost) {
    throw new Error("NEXT_PUBLIC_API_HOST environment variable is not set");
  }
  return `https://${apiHost}`;
};
