import { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { cookies } from "next/headers";
import { UnauthenticatedCheckIn } from "@/components/UnauthenticatedCheckIn";
import { UserProfileContent } from "@/components/UserProfileContent";

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

// Generate metadata dynamically for user profiles
export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;

  return {
    title: `${username}'s Profile - Resonance`,
    description: `View ${username}'s concert journey, stats, and live music timeline on Resonance.`,
    alternates: {
      canonical: `/profile/${username}`,
    },
    openGraph: {
      title: `${username}'s Profile - Resonance`,
      description: `View ${username}'s concert journey and live music experiences.`,
      type: "profile",
      url: `/profile/${username}`,
      images: [
        {
          url: "/og-profile.png", // Custom OG image for user profiles
          width: 1200,
          height: 630,
          alt: `${username}'s Concert Journey - Resonance`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${username}'s Profile - Resonance`,
      description: `View ${username}'s concert journey and live music experiences.`,
      images: ["/og-profile.png"],
    },
  };
}

export default async function UserProfilePage({ params }: ProfilePageProps) {
  // Get the auth token from cookies
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token");
  const isAuthenticated = !!authToken;

  // Await the params to get the username
  const { username } = await params;

  return (
    <>
      <PageHeader title="Profile" subtitle="View user's concert journey" />
      {isAuthenticated ? (
        <UserProfileContent username={username} />
      ) : (
        <UnauthenticatedCheckIn />
      )}
    </>
  );
}
