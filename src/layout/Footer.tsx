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
        <p>Timeline</p>
      </div>
      <div className="flex flex-col items-center gap-1">
        <LuHouse />
        <p>Discover</p>
      </div>
      <div className="flex flex-col items-center gap-1">
        <LuSquarePlus />
        <p>Check-in</p>
      </div>
      <div className="flex flex-col items-center gap-1">
        <LuUsers />
        <p>Friends</p>
      </div>
      <div className="flex flex-col items-center gap-1">
        <LuUser />
        <p>Profile</p>
      </div>
    </footer>
  );
};
export default Footer;
