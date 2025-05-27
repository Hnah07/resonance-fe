import {
  LuClock,
  LuHouse,
  LuSquarePlus,
  LuUser,
  LuUsers,
} from "react-icons/lu";

const Footer = () => {
  return (
    <footer className="flex justify-between items-center w-full">
      <div className="flex flex-col items-center gap-1">
        <LuClock />
        <p className="text-sm">Timeline</p>
      </div>
      <div className="flex flex-col items-center gap-1">
        <LuHouse />
        <p className="text-sm">Discover</p>
      </div>
      <div className="flex flex-col items-center gap-1">
        <LuSquarePlus />
        <p className="text-sm">Check-in</p>
      </div>
      <div className="flex flex-col items-center gap-1">
        <LuUsers />
        <p className="text-sm">Friends</p>
      </div>
      <div className="flex flex-col items-center gap-1">
        <LuUser />
        <p className="text-sm">Profile</p>
      </div>
    </footer>
  );
};
export default Footer;
