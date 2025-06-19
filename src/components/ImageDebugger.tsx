"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getFullUrl } from "@/lib/urls";

interface ImageDebuggerProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImageDebugger({
  src,
  alt,
  className = "w-full h-80 object-cover",
}: ImageDebuggerProps) {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorDetails, setErrorDetails] = useState<string>("");
  const [fullUrl, setFullUrl] = useState<string>("");

  useEffect(() => {
    const url = getFullUrl(src);
    setFullUrl(url);

    // Test if the URL is accessible
    fetch(url, { method: "HEAD" })
      .then((response) => {
        if (response.ok) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorDetails(`HTTP ${response.status}: ${response.statusText}`);
        }
      })
      .catch((error) => {
        setStatus("error");
        setErrorDetails(error.message);
      });
  }, [src]);

  return (
    <div className="border rounded-lg p-4 mb-4">
      <h3 className="font-semibold mb-2">Image Debug Info</h3>
      <div className="text-sm space-y-1 mb-4">
        <p>
          <strong>Original src:</strong> {src}
        </p>
        <p>
          <strong>Full URL:</strong> {fullUrl}
        </p>
        <p>
          <strong>Status:</strong>
          <span
            className={`ml-2 px-2 py-1 rounded text-xs ${
              status === "success"
                ? "bg-green-100 text-green-800"
                : status === "error"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {status}
          </span>
        </p>
        {errorDetails && (
          <p>
            <strong>Error:</strong> {errorDetails}
          </p>
        )}
        <p>
          <strong>User Agent:</strong>{" "}
          {typeof window !== "undefined" ? navigator.userAgent : "SSR"}
        </p>
        <p>
          <strong>Is Mobile:</strong>{" "}
          {typeof window !== "undefined"
            ? /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent
              )
              ? "Yes"
              : "No"
            : "Unknown"}
        </p>
      </div>

      <div className="relative w-full h-40 bg-gray-100 rounded">
        {status === "loading" && (
          <div className="flex items-center justify-center h-full">
            <span>Loading...</span>
          </div>
        )}
        {status === "success" && (
          <Image
            src={fullUrl}
            alt={alt}
            fill
            className={className}
            onError={() => setStatus("error")}
            unoptimized={true}
          />
        )}
        {status === "error" && (
          <div className="flex items-center justify-center h-full text-red-500">
            <span>Failed to load image</span>
          </div>
        )}
      </div>
    </div>
  );
}
