import { PageHeader } from "@/components/PageHeader";
import { cookies } from "next/headers";
import { UnauthenticatedCheckIn } from "@/components/UnauthenticatedCheckIn";
import { ProfileContent } from "@/components/ProfileContent";

export default async function ProfilePage() {
  // Get the auth token from cookies
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token");
  const isAuthenticated = !!authToken;

  return (
    <>
      <PageHeader
        title="Profile"
        subtitle="Your concert journey in one place"
      />
      {isAuthenticated ? <ProfileContent /> : <UnauthenticatedCheckIn />}
    </>
  );
}
