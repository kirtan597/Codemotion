import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CodeMotion - Interactive Algorithm Visualizer",
    template: "%s | CodeMotion",
  },
  description: "Experience algorithms in motion. Interactive visualizations of 144+ algorithms across 16 categories with step-by-step execution and real-time analysis.",
  keywords: ["algorithms", "data structures", "visualization", "coding", "learning", "interactive", "education"],
  authors: [{ name: "CodeMotion Team" }],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/codemotion-logo.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/codemotion-logo.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://codemotion.dev",
    siteName: "CodeMotion",
    title: "CodeMotion - Interactive Algorithm Visualizer",
    description: "Experience algorithms in motion. 144+ interactive visualizations.",
    images: [
      {
        url: "/codemotion-logo.svg",
        width: 512,
        height: 512,
        alt: "CodeMotion - Algorithm Visualizer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeMotion - Interactive Algorithm Visualizer",
    description: "Experience algorithms in motion. 144+ interactive visualizations.",
    images: ["/codemotion-logo.svg"],
  },
  metadataBase: new URL("https://codemotion.dev"),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/codemotion-logo.svg" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
