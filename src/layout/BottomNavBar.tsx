import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LuClock,
  LuHouse,
  LuSquarePlus,
  LuUser,
  LuUsers,
} from "react-icons/lu";

const navItems = [
  {
    href: "/timeline",
    icon: LuClock,
    label: "Timeline",
  },
  {
    href: "/discover",
    icon: LuHouse,
    label: "Discover",
  },
  {
    href: "/check-in",
    icon: LuSquarePlus,
    label: "Check-in",
  },
  {
    href: "/friends",
    icon: LuUsers,
    label: "Friends",
  },
  {
    href: "/profile",
    icon: LuUser,
    label: "Profile",
  },
] as const;

const BottomNavbar = () => {
  const pathname = usePathname();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  // Hide the bottom navbar when the keyboard is visible
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      const isKeyboardOpen = window.visualViewport
        ? window.visualViewport.height < window.innerHeight * 0.8
        : false;
      setIsKeyboardVisible(isKeyboardOpen);
    };

    window.visualViewport?.addEventListener("resize", handleResize);
    window.visualViewport?.addEventListener("scroll", handleResize);

    handleResize();

    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
      window.visualViewport?.removeEventListener("scroll", handleResize);
    };
  }, []);

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 bg-background shadow-lg border-t border-border z-50 py-2 transition-transform duration-200 ${
        isKeyboardVisible ? "translate-y-full" : "translate-y-0"
      }`}
      role="navigation"
      aria-label="main navigation"
    >
      <div className="flex justify-center">
        <div className="flex justify-between items-center w-full max-w-2xl px-4 mx-0 my-0">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg transition-colors ${
                isActive(href)
                  ? "bg-gradient-to-br from-[#FF0086]/10 to-[#03D1FE]/10"
                  : "hover:bg-gradient-to-br hover:from-[#FF0086]/10 hover:to-[#03D1FE]/10"
              }`}
            >
              <Icon className="w-6 h-6 text-foreground" />
              <p className="text-sm text-foreground">{label}</p>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};
export default BottomNavbar;
