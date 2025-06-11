import Link from "next/link";
import { LuMusic } from "react-icons/lu";

const NotFound = () => {
  return (
    <div className="text-center space-y-6">
      <h1 className="text-6xl font-bold bg-gradient-to-r from-[#FF0086] to-[#03D1FE] bg-clip-text text-transparent">
        404
      </h1>
      <h2 className="text-2xl font-semibold">Page Not Found</h2>
      <div className="flex justify-center">
        <p className="text-lg text-muted-foreground max-w-md">
          Oops! The concert you&apos;re looking for seems to have left the
          stage. Let&apos;s get you back to discovering great music.
        </p>
      </div>
      <Link
        href="/discover"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#FF0086] to-[#03D1FE] text-white font-semibold hover:opacity-90 transition-opacity"
      >
        <LuMusic className="h-5 w-5" />
        Back to discover
      </Link>
    </div>
  );
};

export default NotFound;
