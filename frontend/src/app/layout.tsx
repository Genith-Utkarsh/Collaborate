import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Collaborate - VIT Pune Project Showcase",
  description: "Discover and showcase amazing projects from VIT Pune students. Connect, collaborate, and build the future together.",
  keywords: ["VIT Pune", "projects", "students", "showcase", "collaboration", "engineering"],
  authors: [{ name: "VIT Pune Students" }],
  openGraph: {
    title: "Collaborate - VIT Pune Project Showcase",
    description: "Discover and showcase amazing projects from VIT Pune students.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Collaborate - VIT Pune Project Showcase",
    description: "Discover and showcase amazing projects from VIT Pune students.",
  },
  robots: "index, follow",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased min-h-screen`}>
        <AuthProvider>
          <div className="relative min-h-screen bg-background text-foreground">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
