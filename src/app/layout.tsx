import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Braj Nidhi Guesthouse | Divine Stay in Vrindavan",
  description: "Experience the divine and royal hospitality at Braj Nidhi Guesthouse, located in the heart of Vrindavan near Bankey Bihari Temple.",
};

import LoadingTransition from "@/components/LoadingTransition";
import { MusicProvider } from "@/lib/MusicContext";
import NonBlockingCSS from "@/components/NonBlockingCSS";
import { Outfit, Bebas_Neue } from 'next/font/google';

const outfit = Outfit({ 
  subsets: ['latin'], 
  weight: ['300', '400', '600', '700'],
  variable: '--font-outfit',
  display: 'swap',
});

const bebasNeue = Bebas_Neue({ 
  subsets: ['latin'], 
  weight: ['400'],
  variable: '--font-bebas-neue',
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${bebasNeue.variable}`}>
      <head>
        {/* === Performance: DNS prefetch & preconnect for all external resources === */}
        <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        
        {/* Asynchronously preload stylesheets to eliminate 2,170ms render-blocking delay */}
        <link
          rel="preload"
          as="style"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
        />
        <link
          rel="preload"
          as="style"
          href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css"
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
          />
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css"
          />
        </noscript>
      </head>
      <body className="index-page antialiased">
        <NonBlockingCSS />
        <Script src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js" strategy="lazyOnload" />
        <MusicProvider>
          <LoadingTransition />
          {children}
        </MusicProvider>
        {/* Chatling AI Chatbot — inject after page is interactive so config is set first */}
        <Script id="chatling-embed" strategy="lazyOnload">
          {`
            window.chtlConfig = { chatbotId: "6539271511" };
            (function() {
              var s = document.createElement("script");
              s.async = true;
              s.setAttribute("data-id", "6539271511");
              s.id = "chtl-script";
              s.type = "text/javascript";
              s.src = "https://chatling.ai/js/embed.js";
              document.head.appendChild(s);
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
