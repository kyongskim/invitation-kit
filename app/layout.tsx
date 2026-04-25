import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Italiana,
  Playfair_Display,
} from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import { config } from "@/invitation.config";
import "./globals.css";

const pretendard = localFont({
  src: [
    {
      path: "./fonts/Pretendard-Light.subset.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/Pretendard-Regular.subset.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Pretendard-Medium.subset.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-pretendard",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "600"],
});

const italiana = Italiana({
  subsets: ["latin"],
  variable: "--font-italiana",
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  title: config.meta.title,
  description: config.meta.description,
  openGraph: {
    title: config.meta.title,
    description: config.meta.description,
    url: config.meta.siteUrl,
    siteName: config.meta.title,
    images: [
      {
        url: config.share.thumbnailUrl,
        width: 800,
        height: 400,
        alt: config.meta.title,
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: config.meta.title,
    description: config.meta.description,
    images: [config.share.thumbnailUrl],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      data-theme={config.theme}
      className={`${pretendard.variable} ${cormorant.variable} ${playfair.variable} ${italiana.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Script id="scroll-restoration-manual" strategy="beforeInteractive">
          {`history.scrollRestoration = "manual";`}
        </Script>
        {children}
      </body>
    </html>
  );
}
