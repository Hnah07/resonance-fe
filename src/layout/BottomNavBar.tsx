"use client";
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
      className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-blue-950 border-t border-border z-50 py-1 md:py-2 transition-transform duration-200 ${
        isKeyboardVisible ? "translate-y-full" : "translate-y-0"
      }`}
      role="navigation"
      aria-label="main navigation"
    >
      <div className="flex justify-center">
        <div className="flex justify-between items-center w-full max-w-2xl px-4">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center w-[52px] h-[52px] md:w-[64px] md:h-[64px] rounded-lg transition-colors ${
                isActive(href)
                  ? "bg-gradient-to-br from-[#FF0086]/30 to-[#03D1FE]/30"
                  : "hover:bg-gradient-to-br hover:from-[#FF0086]/10 hover:to-[#03D1FE]/10"
              }`}
            >
              <Icon className="w-4 h-4 md:w-5 md:h-5 text-foreground mb-0.5 md:mb-1" />
              <p className="text-[10px] md:text-xs text-foreground">{label}</p>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};
export default BottomNavbar;
