import { ConcertCard } from "@/components/ConcertCard";
import { PageHeader } from "@/components/PageHeader";
import { GradientButton } from "@/components/ui/gradient-button";

const TimelinePage = () => {
  return (
    <>
      <div className="flex flex-col items-center mb-12">
        <PageHeader title="Timeline" subtitle="See what everyone is up to" />
        <GradientButton>+ Check In</GradientButton>
      </div>
      <ConcertCard />
    </>
  );
};
export default TimelinePage;
