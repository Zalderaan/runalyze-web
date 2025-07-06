import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/user_context";
import QueryProvider from "../providers/QueryProvider";
// import { UserProvider } from '@/context/userContext'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Runalyze",
  description: "Runalyze",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* <header>Header test</header> */}
        <div className="flex flex-col gap-4 h-screen">
          <QueryProvider>
            <AuthProvider>
                {children}
            </AuthProvider>
          </QueryProvider>
        </div>
      </body>
    </html>
  );
}
