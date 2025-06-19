import { PageHeader } from "@/components/PageHeader";
import { UserSearch } from "@/components/UserSearch";
import { cookies } from "next/headers";
import { UnauthenticatedCheckIn } from "@/components/UnauthenticatedCheckIn";

export default async function SearchPage() {
  // Get the auth token from cookies
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token");
  const isAuthenticated = !!authToken;

  return (
    <>
      <PageHeader title="Search Users" subtitle="Find other concert-goers" />
      {isAuthenticated ? (
        <div className="max-w-2xl mx-auto">
          <UserSearch />
        </div>
      ) : (
        <UnauthenticatedCheckIn />
      )}
    </>
  );
}
