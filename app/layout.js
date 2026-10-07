import "./globals.css";

const FONT_STYLESHEET =
  "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Sarabun:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap";

export const metadata = {
  title: "Full Stack Developer",
  description: "เว็บอ่านบทเรียน Full Stack Developer",
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
