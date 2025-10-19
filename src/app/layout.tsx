import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <script
        dangerouslySetInnerHTML={{
          __html: `
        document.addEventListener('deviceready', () => {
          var initialHeight = document.documentElement.clientHeight;
          window.addEventListener('resize', getStatusBarHeight);
          StatusBar.overlaysWebView(true);
          function getStatusBarHeight() {
              var currentHeight = document.documentElement.clientHeight;
              document.documentElement.style.setProperty('--safe-area-top', (currentHeight - initialHeight) + 'px');
              window.removeEventListener('resize', getStatusBarHeight);
          }
      }, false);
        `,
        }}
      />
      <body
        className={`${nanumGothic.variable} ${nanumGothic.className} antialiased`}
      >
        {children}
        <Toaster
          position="bottom-center"
          offset={10}
          mobileOffset={{
            bottom: "calc(10px + env(safe-area-inset-bottom, 0px))",
          }}
        />
      </body>
    </html>
  );
}
