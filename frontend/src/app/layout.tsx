import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import AuthWrapper from "@/components/AuthWrapper";

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
      className={`${inter.variable} ${dmSerif.variable} h-full antialiased bg-canvas text-stone-800 selection:bg-teal selection:text-white`}
    >
      <body className="font-sans min-h-[100dvh] flex flex-col">
        <AuthProvider>
          <AuthWrapper>
            {children}
          </AuthWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
