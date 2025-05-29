import {
  LuClock,
  LuHouse,
  LuSquarePlus,
  LuUser,
  LuUsers,
} from "react-icons/lu";

const BottomNavbar = () => {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-background shadow-lg border-t border-border z-50"
      role="navigation"
      aria-label="main navigation"
    >
      <div className="flex justify-center">
        <div className="flex justify-between items-center w-full max-w-2xl px-4 py-0 mx-0 my-0">
          <div className="flex flex-col items-center gap-1 pb-1 mb-1 mt-2 pt-1">
            <LuClock className="w-10 h-10 text-foreground px-2 py-2" />
            <p className="text-sm text-foreground">Timeline</p>
          </div>
          <div className="flex flex-col items-center gap-1 pb-1 mb-1 mt-2 pt-1">
            <LuHouse className="w-10 h-10 text-foreground px-2 py-2" />
            <p className="text-sm text-foreground">Discover</p>
          </div>
          <div className="flex flex-col items-center gap-1 pb-1 mb-1 mt-2 pt-1">
            <LuSquarePlus className="w-10 h-10 text-foreground px-2 py-2" />
            <p className="text-sm text-foreground">Check-in</p>
          </div>
          <div className="flex flex-col items-center gap-1 pb-1 mb-1 mt-2 pt-1">
            <LuUsers className="w-10 h-10 text-foreground px-2 py-2" />
            <p className="text-sm text-foreground">Friends</p>
          </div>
          <div className="flex flex-col items-center gap-1 pb-1 mb-1 mt-2 pt-1">
            <LuUser className="w-10 h-10 text-foreground px-2 py-2" />
            <p className="text-sm text-foreground">Profile</p>
          </div>
        </div>
      </div>
    </nav>
  );
};
export default BottomNavbar;
