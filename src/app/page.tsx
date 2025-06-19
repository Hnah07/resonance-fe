import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Resonance - Your Digital Memory Book for Live Music",
  description:
    "Discover concerts, check in to shows, and relive your live music moments. Track your favorite artists, explore local events, and connect with fellow music lovers through your concert journey.",
  keywords:
    "live music, concerts, music tracking, concert check-in, music community, concert discovery, music timeline, concert memories",
  openGraph: {
    title: "Resonance - Your Digital Memory Book for Live Music",
    description:
      "Discover concerts, check in to shows, and relive your live music moments. Your personal timeline of live music experiences.",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png", // You'll need to add this image
        width: 1200,
        height: 630,
        alt: "Resonance - Your Live Music Journey",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Resonance - Your Digital Memory Book for Live Music",
    description:
      "Discover concerts, check in to shows, and relive your live music moments.",
    images: ["/og-image.png"], // You'll need to add this image
  },
};

const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="px-4 py-16 sm:py-24 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-[#FF0086] to-[#03D1FE] bg-clip-text text-transparent">
          Your Live Music Journey, Preserved
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Discover. Check in. Relive. Resonance is your digital memory book for
          live music. Track your concerts, explore new shows, and never forget
          the thrill of a live performance.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-[#FF0086] to-[#03D1FE] text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Register Now
          </Link>
          <Link
            href="/discover"
            className="px-8 py-3 rounded-lg border border-border hover:bg-accent transition-colors"
          >
            Search Concerts
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Your Complete Concert Companion
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-background shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Track Your Shows</h3>
              <p className="text-muted-foreground">
                Check in to concerts, build your artist history, and create a
                personal timeline of your live music experiences.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-background shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Discover New Music</h3>
              <p className="text-muted-foreground">
                Find local events, explore different genres, and get
                recommendations based on your music taste and location.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-background shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Connect & Share</h3>
              <p className="text-muted-foreground">
                See where your friends are going, share your concert
                experiences, and connect with fellow music enthusiasts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Genre Stats Preview */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Your Music Journey, Visualized
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            From underground techno to indie rock and heavy metal, track your
            genre preferences and see your music taste evolve over time.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-lg bg-background shadow-sm">
              <h3 className="text-2xl font-bold text-[#FF0086] mb-2">150+</h3>
              <p className="text-muted-foreground">Concerts Tracked</p>
            </div>
            <div className="p-6 rounded-lg bg-background shadow-sm">
              <h3 className="text-2xl font-bold text-[#03D1FE] mb-2">12</h3>
              <p className="text-muted-foreground">Genres Explored</p>
            </div>
            <div className="p-6 rounded-lg bg-background shadow-sm">
              <h3 className="text-2xl font-bold text-[#FF0086] mb-2">45</h3>
              <p className="text-muted-foreground">Venues Visited</p>
            </div>
            <div className="p-6 rounded-lg bg-background shadow-sm">
              <h3 className="text-2xl font-bold text-[#03D1FE] mb-2">89</h3>
              <p className="text-muted-foreground">Artists Seen</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-4 py-16 text-center bg-muted/50">
        <h2 className="text-3xl font-bold mb-6">
          Start Your Live Music Journey
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Join music lovers who are already documenting their concert
          experiences and discovering new shows on Resonance.
        </p>
        <Link
          href="/register"
          className="inline-block px-8 py-3 rounded-lg bg-gradient-to-r from-[#FF0086] to-[#03D1FE] text-white font-semibold hover:opacity-90 transition-opacity"
        >
          Begin Your Timeline
        </Link>
      </section>
    </div>
  );
};

export default HomePage;
