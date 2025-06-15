import { PageHeader } from "@/components/PageHeader";
import { UnauthenticatedCheckIn } from "@/components/UnauthenticatedCheckIn";
import { TimelineContent } from "@/components/TimelineContent";
import { cookies } from "next/headers";

export default async function TimelinePage() {
  // Get the auth token from cookies
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token");
  const isAuthenticated = !!authToken;

  return (
    <>
      <PageHeader
        title="Timeline"
        subtitle="Resonate with your friends through check-ins"
      />
      {isAuthenticated ? <TimelineContent /> : <UnauthenticatedCheckIn />}
    </>
  );
}
