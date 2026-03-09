import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SkipLink } from "@/components/SkipLink";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Footer } from "@/components/veriact";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "veri.fi — AI-verified proof of action on Creditcoin",
  description: "Turn real-world activity into programmable proof. Create tasks, submit proof, get verified.",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${outfit.variable} font-sans antialiased min-h-screen flex flex-col`}
        style={{ backgroundColor: "#0a0a0a", color: "#f4f4f5" }}
      >
        <ErrorBoundary>
          <Providers>
            <SkipLink />
            <div className="flex flex-col min-h-screen">
              <div className="flex-1">{children}</div>
              <Footer />
            </div>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
