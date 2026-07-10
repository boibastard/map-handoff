import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";
import "./styles/ui.css"
import { GoogleAnalytics } from "@next/third-parties/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Map Handoff | Send Google Maps Destinations Between Devices",
  description: "Send addresses, coordinates, or Google Maps links from your phone to your tablet using a simple pair code.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  //const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const gaId = "G-J6JYPKCY30";
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  );
}
