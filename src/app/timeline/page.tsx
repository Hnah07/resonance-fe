import { CheckInCard } from "@/components/CheckInCard";
import { PageHeader } from "@/components/PageHeader";
import { GradientButton } from "@/components/ui/gradient-button";

const TimelinePage = () => {
  // This will be from the API
  const hasCheckIns = true; // For now hardcoded to show the "no check-ins" message

  return (
    <>
      <div className="flex flex-col items-center mb-12">
        <PageHeader title="Timeline" subtitle="See what everyone is up to" />
        <GradientButton>+ Check In</GradientButton>
      </div>
      {hasCheckIns ? (
        <CheckInCard
          user={{ id: "1", name: "Jan Lebbe", username: "kathedraaltje" }}
          concert={{
            id: "1",
            event: "Graspop Metal Meeting",
            image: "/summer-festival.jpg",
            location: "Dessel",
            city: "Belgium",
            date: "2025-05-30",
            rating: 3.5,
            artists: [
              "Sabaton",
              "Arch Enemy",
              "Children of Bodom",
              "Korn",
              "Iron Maiden",
              "Slipknot",
              "Lorna Shore",
              "Nine Inch Nails",
              "System of a Down",
              "Linkin Park",
              "Disturbed",
              "Avenged Sevenfold",
              "Megadeth",
              "Anthrax",
              "Slayer",
              "Metallica",
            ],
            genres: ["Metal", "Rock", "Folk"],
          }}
          checkIn={{
            id: "1",
            date: "2025-05-30",
            time: "16:00",
            comment: "Damn, what a festival!",
            likes: 10,
            comments: [
              {
                id: "1",
                user: { id: "1", name: "John Doe" },
                text: "Damn, what a festival!",
                date: "2025-05-30",
              },
              {
                id: "2",
                user: { id: "2", name: "Jane Doe" },
                text: "I loved it!",
                date: "2025-05-30",
              },
            ],
          }}
        />
      ) : (
        <div className="text-center text-gray-600 mt-8">
          <p className="text-lg">
            No check-ins yet. Go to a concert and start getting friends!
          </p>
        </div>
      )}
    </>
  );
};
export default TimelinePage;
