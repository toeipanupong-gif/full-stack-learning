import "./globals.css";
import { courseName, getSiteUrl, SITE_DESCRIPTION } from "@/lib/seo";

const FONT_STYLESHEET =
  "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Sarabun:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap";

const name = courseName();

export const metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: name,
    template: `%s · ${name}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: name,
  openGraph: {
    type: "website",
    locale: "th_TH",
    siteName: name,
    title: name,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: name,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href={FONT_STYLESHEET} rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-paper text-ink antialiased">{children}</body>
    </html>
  );
}
