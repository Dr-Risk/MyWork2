
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { PT_Sans, Space_Grotesk } from "next/font/google";

/**
 * @fileoverview Root Layout
 * 
 * @description
 * This is the root layout for the entire application. It's the top-level
 * component that wraps every page. It's responsible for:
 * 1. Defining the `<html>` and `<body>` tags.
 * 2. Importing and applying global stylesheets (`globals.css`).
 * 3. Setting up custom fonts using `next/font`.
 * 4. Wrapping the entire application in the `AuthProvider` to provide
 *    authentication context to all components.
 * 5. Including the `Toaster` component to handle pop-up notifications.
 */

// Configure the PT Sans font for the body text.
const ptSans = PT_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pt-sans", // CSS variable for easy use in Tailwind.
  weight: ["400", "700"],
});

// Configure the Space Grotesk font for headlines.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk", // CSS variable.
  weight: ["400", "700"],
});

// Metadata for the application, used for SEO and the browser tab title.
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
      // Apply the font variables to the html tag.
      className={`${ptSans.variable} ${spaceGrotesk.variable}`}
      // Suppress a common warning related to extensions modifying the DOM.
      suppressHydrationWarning
    >
      <head />
      <body className="font-body antialiased" suppressHydrationWarning>
        {/* AuthProvider makes user authentication data available to all child components. */}
        <AuthProvider>
          {children}
        </AuthProvider>
        {/* Toaster is the component that displays toast notifications. */}
        <Toaster />
      </body>
    </html>
  );
}
