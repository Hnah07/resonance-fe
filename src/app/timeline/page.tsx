import { CheckInCard } from "@/components/CheckInCard";
import { PageHeader } from "@/components/PageHeader";
import { GradientButton } from "@/components/ui/gradient-button";

const TimelinePage = () => {
  return (
    <>
      <div className="flex flex-col items-center mb-12">
        <PageHeader title="Timeline" subtitle="See what everyone is up to" />
        <GradientButton>+ Check In</GradientButton>
      </div>
      <CheckInCard
        user={{ id: "1", name: "John Doe" }}
        concert={{
          id: "1",
          event: "Graspop Metal Meeting",
          image: "/summer-festival.jpg",
          location: "Dessel",
          city: "Belgium",
          date: "2025-06-21",
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
          date: "2025-06-21",
          comment: "Damn, what a festival!",
          likes: 10,
          comments: 5,
        }}
      />
    </>
  );
};
export default TimelinePage;
