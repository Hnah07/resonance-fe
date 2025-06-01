import { PageHeader } from "@/components/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatCard } from "@/components/StatCard";
import Image from "next/image";
import {
  LuMapPin,
  LuMusic,
  LuGlobe,
  LuCalendar,
  LuHeart,
  LuStar,
  LuTicket,
} from "react-icons/lu";

interface ProfilePageProps {
  //   id: string;
  //   name: string;
  //   bio: string;
  image: string;
}

const ProfilePage = ({ image }: ProfilePageProps) => {
  return (
    <>
      <div className="flex items-center gap-2 mb-4 justify-center">
        <Avatar className="w-32 h-32 border-4 border-accent-cyan/50">
          <AvatarImage src={image} />
          <AvatarFallback>
            <Image
              src="/placeholder-avatar-user.jpg"
              alt="Placeholder avatar"
              width={128}
              height={128}
              className="rounded-full"
            />
          </AvatarFallback>
        </Avatar>
      </div>
      <PageHeader title="John Doe" />
      <div className="flex flex-col items-center gap-4 text-accent-cyan mb-8">
        <p className="text-sm text-muted-foreground">
          I am a metalhead, but also into house music
        </p>
        <div className="flex gap-2">
          <LuMapPin className="w-4 h-4" />
          <p className="text-sm text-muted-foreground">Mortsel, Belgium</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
        <StatCard
          icon={<LuCalendar className="w-6 h-6" />}
          title="Concerts This Year"
          value={12}
          details="You've been to 12 concerts in 2024 so far. Your most recent concert was Metallica in Brussels."
        />
        <StatCard
          icon={<LuTicket className="w-6 h-6" />}
          title="Concerts Attended"
          value={50}
          details="You've attended 50 concerts in total since you started tracking your concert history."
        />
        <StatCard
          icon={<LuGlobe className="w-6 h-6" />}
          title="Countries Visited"
          value={5}
          details="You've seen concerts in Belgium, Netherlands, Germany, France, and the UK."
        />
        <StatCard
          icon={<LuMusic className="w-6 h-6" />}
          title="Favorite Genre"
          value="Metal"
          details="Metal is your most frequently attended genre, making up 60% of your concert history."
        />
        <StatCard
          icon={<LuHeart className="w-6 h-6" />}
          title="Most Seen Artist"
          value="Metallica"
          details="You've seen Metallica 5 times across different venues and countries."
        />
        <StatCard
          icon={<LuStar className="w-6 h-6" />}
          title="Top Venue"
          value="De Grootste Zaal ter Wereld"
          details="You've visited this venue 8 times, making it your most frequented concert location."
        />
      </div>
    </>
  );
};

export default ProfilePage;
