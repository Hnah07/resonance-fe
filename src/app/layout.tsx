import Header from "@/layout/Header";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

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
    <html lang="en" suppressHydrationWarning>
      <body className="p-4">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
