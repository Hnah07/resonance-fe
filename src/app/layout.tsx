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

const rootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html>
      <Header />
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
};
export default rootLayout;
