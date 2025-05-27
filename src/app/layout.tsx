import Header from "@/layout/Header";
import "./globals.css";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resonance",
  description: "Resonance",
  icons: {
    icon: "/favicon.ico",
  },
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className="p-4">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
};

export default RootLayout;
