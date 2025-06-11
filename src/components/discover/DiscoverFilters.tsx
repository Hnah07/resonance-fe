import { useGeolocation } from "@/hooks/useGeolocation";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

export function DiscoverFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { latitude, longitude, error, isLoading } = useGeolocation();

  const handleLocationClick = async () => {
    if (error) {
      toast.error("Location Error", {
        description: error,
      });
      return;
    }

    if (isLoading) {
      return;
    }

    if (latitude && longitude) {
      // Update URL with coordinates
      const params = new URLSearchParams(searchParams.toString());
      params.set("lat", latitude.toString());
      params.set("lng", longitude.toString());
      router.push(`/discover?${params.toString()}`);

      toast.success("Location Updated", {
        description: "Using your current location",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleLocationClick}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
          <span className="ml-2">Use My Location</span>
        </Button>
      </div>
    </div>
  );
}
