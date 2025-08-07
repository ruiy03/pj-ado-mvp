import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { auth } from "../../auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "広告管理システム",
  description: "広告コンテンツ管理システム",
};

export default async function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  
  return (
    <html lang="ja">
    <body
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
    {session?.user ? (
      <div className="flex">
        <Sidebar/>
        <main className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen">
          {children}
        </main>
      </div>
    ) : (
      <div>
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">LMG 広告管理</h1>
              </div>
            </div>
          </div>
        </nav>
        <main className="p-8 bg-gray-50 min-h-screen">
          {children}
        </main>
      </div>
    )}
    </body>
    </html>
  );
}
