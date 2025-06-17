import { PageHeader } from "@/components/PageHeader";
import { cookies } from "next/headers";
import { UnauthenticatedCheckIn } from "@/components/UnauthenticatedCheckIn";
import { UserProfileContent } from "@/components/UserProfileContent";

interface ProfilePageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function UserProfilePage({ params }: ProfilePageProps) {
  // Get the auth token from cookies
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token");
  const isAuthenticated = !!authToken;

  // Await the params to get the userId
  const { userId } = await params;

  return (
    <>
      <PageHeader title="Profile" subtitle="View user's concert journey" />
      {isAuthenticated ? (
        <UserProfileContent userId={userId} />
      ) : (
        <UnauthenticatedCheckIn />
      )}
    </>
  );
}
