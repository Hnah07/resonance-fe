import Image from "next/image";
import { GoGear } from "react-icons/go";

const Header = () => {
  return (
    <header className="flex justify-between items-center w-full">
      <div className="flex items-center gap-2">
        <Image src="/favicon.ico" alt="logo" width={50} height={50} />
        <h1 className="text-xl">Resonance</h1>
      </div>
      <div className="flex items-center">
        <GoGear size={24} />
      </div>
    </header>
  );
};
export default Header;
