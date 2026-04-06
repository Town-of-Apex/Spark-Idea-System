import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Spark Idea System",
  description: "Short-form idea sharing marketplace for the Town of Apex",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${dmSerif.variable} h-full antialiased bg-soft-canvas text-deep-ink selection:bg-apex-green selection:text-white`}
    >
      <body className="font-sans min-h-screen flex flex-row">
        <Sidebar />
        <div className="flex-1 overflow-auto h-screen relative bg-soft-canvas">
          {children}
        </div>
      </body>
    </html>
  );
}
