import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/theme-provider";
import { LanguageProvider } from "../context/LanguageContext";
import { LocationProvider } from "../context/LocationContext";
import { CartProvider } from "../context/CartContext";
import { WishlistProvider } from "../context/WishlistContext";
import ProfileCompletionCheck from "@/components/ProfileCompletionCheck";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vallaroo - Your Local Shopping Companion",
  description: "Shop from your favorite local stores with Vallaroo. Fast delivery, fresh products, and great prices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <LocationProvider>
              <WishlistProvider>
                <CartProvider>
                  <ProfileCompletionCheck />
                  {children}
                </CartProvider>
              </WishlistProvider>
            </LocationProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
