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
        />
        <StatCard
          icon={<LuTicket className="w-6 h-6" />}
          title="Concerts Attended"
          value={50}
        />
        <StatCard
          icon={<LuGlobe className="w-6 h-6" />}
          title="Countries Visited"
          value={5}
        />
        <StatCard
          icon={<LuMusic className="w-6 h-6" />}
          title="Favorite Genre"
          value="Metal"
        />

        <StatCard
          icon={<LuHeart className="w-6 h-6" />}
          title="Most Seen Artist"
          value="Metallica"
        />
        <StatCard
          icon={<LuStar className="w-6 h-6" />}
          title="Top Venue"
          value="AB Brussels"
        />
      </div>
    </>
  );
};

export default ProfilePage;
