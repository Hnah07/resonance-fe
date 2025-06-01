import { PageHeader } from "@/components/PageHeader";
import SuggestionCard from "@/components/SuggestionCard";
import { Input } from "@/components/ui/input";
import { LuSearch } from "react-icons/lu";

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
    </>
  );
};
export default CheckInPage;
