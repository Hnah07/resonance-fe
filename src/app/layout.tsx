import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/layout/Header";

import { Metadata } from "next";
import BottomNavbar from "@/layout/BottomNavBar";

export const metadata: Metadata = {
  title: "Resonance",
  description: "Resonance",
  icons: {
    icon: "/favicon.ico",
  },
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="mx-auto max-w-2xl px-4">{children}</main>
          <BottomNavbar />
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
