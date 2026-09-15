import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "PharmaLens AI | Commercial Intelligence",
  description: "Pharmaceutical commercial analysis from data to decision",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body className="min-h-screen antialiased">
        <Sidebar />
        <main className="min-h-screen lg:pl-[286px]">{children}</main>
      </body>
    </html>
  );
}
