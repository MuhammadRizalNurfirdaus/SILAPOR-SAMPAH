import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "SILAPOR SAMPAH — DLH Kabupaten Kuningan",
  description:
    "Sistem Lapor dan Pemantauan Pengangkutan Sampah Dinas Lingkungan Hidup Kabupaten Kuningan",
  icons: {
    icon: "/logo-dlh-kuningan.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} antialiased`}>
      <body className="font-sans min-h-dvh flex flex-col">{children}</body>
    </html>
  );
}
