import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TopNavbar } from "@/components/ui/top-navbar";
import { ThemeProvider } from "@/contexts/ThemeContext";

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
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased bg-white dark:bg-gray-950">
        <ThemeProvider>
          <div className="grid grid-rows-[auto_1fr] h-dvh overflow-hidden">
            <TopNavbar />
            <main className="overflow-hidden bg-white dark:bg-gray-950">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
