import { ThemeSwitch } from "@/components/ThemeSwitch";
import Image from "next/image";

const Header = () => {
  return (
    <header className="sticky top-0 bg-background shadow-lg border-b border-border mb-12 z-50">
      <div className="flex justify-center">
        <div className="flex justify-between items-center w-full max-w-2xl px-0 py-0 mx-0 my-0">
          <div className="flex items-center gap-2 ml-3 pb-1 mb-1 mt-2 pt-1">
            <Image
              src="/logo-resonance-transparant.png"
              alt="logo resonance"
              width={50}
              height={50}
            />
            <h1 className="text-xl font-semibold text-foreground">Resonance</h1>
          </div>
          <div className="flex items-center pb-1 mb-1 mr-4 pr-4 mt-2 pt-1">
            <ThemeSwitch />
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;
