import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TopNavbar } from "@/components/ui/top-navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Tripmind - Travel Planning Made Simple",
  description: "Plan your trips, organize activities on a timeline, manage bookings, and work offline with Tripmind.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-white dark:bg-gray-950">
        <div className="flex flex-col h-screen overflow-hidden">
          <TopNavbar />
          <main className="flex-1 overflow-auto bg-white dark:bg-gray-950">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
