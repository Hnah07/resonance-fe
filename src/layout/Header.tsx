import { ThemeSwitch } from "@/components/ThemeSwitch";
import Image from "next/image";

const Header = () => {
  return (
    <header className="flex justify-between items-center w-full">
      <div className="flex items-center gap-2">
        <Image src="/favicon.ico" alt="logo" width={50} height={50} />
        <h1 className="text-xl">Resonance</h1>
      </div>
      <div>
        <ThemeSwitch />
      </div>
    </header>
  );
};
export default Header;
