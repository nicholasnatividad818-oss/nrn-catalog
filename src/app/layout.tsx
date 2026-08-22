import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NRN Music Catalog",
  description: "Central music catalog for independent artists — tracks, releases, credits, splits, and metadata.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-nrn-black text-nrn-paper antialiased">
        {children}
      </body>
    </html>
  );
}
