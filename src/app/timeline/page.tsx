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
        user={{ id: "1", name: "John Doe", image: "/images/user.png" }}
        concert={{
          id: "1",
          name: "Concert 1",
          image: "/summer-festival.jpg",
          venue: "Concert Hall",
          date: "2021-01-01",
          rating: 5,
          artists: ["Artist 1", "Artist 2"],
          genres: ["Genre 1", "Genre 2"],
        }}
        checkIn={{
          id: "1",
          date: "2021-01-01",
          comment: "Great concert",
          likes: 10,
          comments: 5,
        }}
      />
    </>
  );
};
export default TimelinePage;
