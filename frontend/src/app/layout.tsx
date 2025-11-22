import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NavigationSidebar } from "@/components/ui/navigation-sidebar";

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
      <body className="font-sans antialiased bg-gray-50 dark:bg-gray-950">
        <div className="flex h-screen overflow-hidden">
          <NavigationSidebar />
          <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950">
            <div className="min-h-full">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
