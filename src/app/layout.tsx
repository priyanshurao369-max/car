import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SnowfallOverlay from "@/components/SnowfallOverlay";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Car Physics Sandbox",
  description: "Top-down physics driving sandbox",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <SnowfallOverlay />
        {children}
      </body>
    </html>
  );
}
