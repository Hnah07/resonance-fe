import Link from "next/link";
import { LuMusic } from "react-icons/lu";

const NotFound = () => {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-[#FF0086] to-[#03D1FE] bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-2xl font-semibold">Page Not Found</h2>
        <p className="text-lg text-muted-foreground max-w-md">
          Oops! The concert you&apos;re looking for seems to have left the
          stage. Let&apos;s get you back to discovering great music.
        </p>
        <Link
          href="/discover"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#FF0086] to-[#03D1FE] text-white font-semibold hover:opacity-90 transition-opacity"
        >
          <LuMusic className="h-5 w-5" />
          Back to discover
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
