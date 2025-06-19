import { Metadata } from "next";
import AddConcertCard from "@/components/AddConcertCard";
import { PageHeader } from "@/components/PageHeader";
import SuggestionCard from "@/components/SuggestionCard";
import { Input } from "@/components/ui/input";
import { LuSearch } from "react-icons/lu";

export const metadata: Metadata = {
  title: "Check In - Resonance",
  description:
    "Check in to concerts and share your live music experiences. Track your concert history and discover new shows.",
  openGraph: {
    title: "Check In - Resonance",
    description:
      "Check in to your favorite concerts and share your live music moments.",
    type: "website",
  },
};

const CheckInPage = () => {
  return (
    <>
      <PageHeader
        title="Check In"
        subtitle="Check in to your favorite concerts"
      />
      <div className="relative mb-4">
        <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
        <Input
          className="pl-10 dark:bg-white dark:placeholder-blue-950 dark:text-blue-950"
          type="text"
          placeholder="Search concerts, locations, or artists..."
        />
      </div>
      <SuggestionCard
        id="1"
        event="Alcatraz"
        date="2025-05-31"
        city="Kortrijk"
        country="Belgium"
        artists={[
          "Lorna Shore",
          "Chelsea Grin",
          "The Devil Wears Prada",
          "The Plot in You",
          "Paleface Swiss",
          "The Ghost Inside",
          "The Acacia Strain",
          "The Red Death",
        ]}
        genres={["Deathcore", "Metalcore", "Metal", "Rock", "Alternative"]}
      />
      <SuggestionCard
        id="2"
        event="Wacken Open Air"
        date="2025-08-02"
        city="Wacken"
        country="Germany"
        artists={[
          "Sabaton",
          "Arch Enemy",
          "Children of Bodom",
          "Dimmu Borgir",
          "Rammstein",
          "Iron Maiden",
        ]}
        genres={["Metal", "Rock", "Alternative"]}
      />
      <SuggestionCard
        id="3"
        event="Glastonbury"
        date="2025-06-26"
        city="Pilton"
        country="United Kingdom"
        artists={[
          "The Strokes",
          "Fontaines D.C.",
          "The 1975",
          "The Killers",
          "The Weeknd",
          "The Cure",
          "The Smiths",
          "The Beatles",
          "The Rolling Stones",
          "The Who",
          "The Doors",
        ]}
        genres={["Rock", "Indie", "Pop", "Alternative", "Punk", "Glam"]}
      />
      <AddConcertCard />
    </>
  );
};
export default CheckInPage;
