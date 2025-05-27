import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/layout/Header";
import Footer from "@/layout/Footer";

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
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
