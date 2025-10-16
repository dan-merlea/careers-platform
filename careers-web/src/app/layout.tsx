import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hatch Beacon",
  description: "The beacon for hiring success",
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'icon', url: '/favicon-light.ico', media: '(prefers-color-scheme: light)' },
    { rel: 'icon', url: '/favicon-dark.ico', media: '(prefers-color-scheme: dark)' },
    { rel: 'apple-touch-icon', url: '/logo192.png' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-kokoro antialiased`}>
        <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
          <main className="flex-grow">{children}</main>
        </div>
      </body>
    </html>
  );
}
