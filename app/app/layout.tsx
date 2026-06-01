import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gmail Mastery - Symulator",
  description: "Interaktywne szkolenie z zaawansowanych funkcji Gmaila",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className="h-full">
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}
