import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { LuSearch } from "react-icons/lu";

const CheckInPage = () => {
  return (
    <>
      <PageHeader
        title="Check In"
        subtitle="Check in to your favorite concerts"
      />
      <div className="relative">
        <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
        <Input
          className="pl-10 dark:bg-white dark:placeholder-blue-950 dark:text-blue-950"
          type="text"
          placeholder="Search concerts, locations, or artists..."
        />
      </div>
    </>
  );
};
export default CheckInPage;
