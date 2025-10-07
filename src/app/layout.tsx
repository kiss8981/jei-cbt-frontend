import type { Metadata } from "next";
import { Nanum_Gothic } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const nanumGothic = Nanum_Gothic({
  variable: "--font-nanum-gothic",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "홈",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${nanumGothic.variable} ${nanumGothic.className} antialiased`}
      >
        {children}
        <Toaster position="bottom-center" mobileOffset={{ bottom: "110px" }} />
      </body>
    </html>
  );
}
