
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { PT_Sans, Space_Grotesk } from "next/font/google";

const ptSans = PT_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pt-sans",
  weight: ["400", "700"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "MediTask",
  description: "Task management for healthcare workers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ptSans.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <head />
      <body className="font-body antialiased" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
