import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { TopNav } from "@/components/layout/top-nav";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AERIS",
  description: "Air Environmental Response & Intelligence System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} bg-zinc-950 text-zinc-50 antialiased`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Suspense fallback={<div className="h-20 bg-zinc-950/80 border-b border-zinc-900" />}>
              <TopNav />
            </Suspense>
            <main className="flex-1 p-6 pt-28">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
