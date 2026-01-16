import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Strive - Build better wellbeing habits together",
  description: "A wellbeing habit tracker for schools. Help students build sustainable habits, track progress, and foster accountability.",
  icons: {
    icon: "/strive-logo-primary-on-transparent.png",
  },
  openGraph: {
    title: "Strive - Build better wellbeing habits together",
    description: "A wellbeing habit tracker for schools. Help students build sustainable habits, track progress, and foster accountability.",
    url: "https://strive-app-2025.vercel.app",
    siteName: "Strive",
    images: [
      {
        url: "/strive-full-colour-with-padding.png",
        width: 800,
        height: 600,
        alt: "Strive Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Strive - Build better wellbeing habits together",
    description: "A wellbeing habit tracker for schools. Help students build sustainable habits, track progress, and foster accountability.",
    images: ["/strive-full-colour-with-padding.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className={`${lexend.variable} font-[family-name:var(--font-lexend)] antialiased`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
