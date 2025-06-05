import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/layout/Header";
import { Metadata, Viewport } from "next";
import BottomNavbar from "@/layout/BottomNavBar";
import { Container } from "@/components/ui/container";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FF0086",
};

export const metadata: Metadata = {
  title: "Resonance",
  description: "Your Digital Memory Book for Live Music",
  manifest: "/manifest.json",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  ),
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Resonance",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
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
          <Container className="pb-24">
            <main>{children}</main>
          </Container>
          <BottomNavbar />
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
