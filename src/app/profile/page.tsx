import { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { cookies } from "next/headers";
import { UnauthenticatedCheckIn } from "@/components/UnauthenticatedCheckIn";
import { ProfileContent } from "@/components/ProfileContent";

export const metadata: Metadata = {
  title: "Profile - Resonance",
  description:
    "View your concert journey, stats, and live music timeline. Track your favorite artists and venues.",
  openGraph: {
    title: "Profile - Resonance",
    description:
      "Your concert journey in one place. View your stats, timeline, and live music memories.",
    type: "website",
  },
};

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
