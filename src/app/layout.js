import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Providers } from "./providers";
import Navigation from "@/components/Navigation";
import CartSidebar from "@/components/CartSidebar";
import StickyPlayer from "@/components/StickyPlayer";
import Footer from "@/components/Footer";
// import NewsletterPopup from "@/components/NewsletterPopup"; // Removed - discount now on registration
// import AffiliateTracker from "@/components/AffiliateTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://agonybeats.com'),
  title: {
    default: "AGONYBEATS | Premium Beats & Sound Kits",
    template: "%s | AGONYBEATS"
  },
  description: "Sounds from the Cosmos. Explore premium dark space trap beats, futuristic hip-hop instrumentals, and exclusive sound kits. Elevate your music production with beats that are out of this world.",
  keywords: ["beats", "trap beats", "hip hop beats", "sound kits", "producer", "instrumentals", "dark trap", "space trap", "beat store", "music production", "agonybeats"],
  authors: [{ name: "AgonyBeats" }],
  creator: "AgonyBeats",
  publisher: "AgonyBeats",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  manifest: '/manifest.json',

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'AGONYBEATS',
    title: 'AGONYBEATS | Premium Beats & Sound Kits',
    description: 'Sounds from the Cosmos. Premium dark space trap beats and futuristic hip-hop instrumentals.',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'AGONYBEATS - Sounds from the Cosmos',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AGONYBEATS | Premium Beats & Sound Kits',
    description: 'Sounds from the Cosmos. Premium dark space trap beats and futuristic hip-hop instrumentals.',
    images: ['/logo.png'],
    creator: '@andrea_delfoco',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// Viewport configuration (separate from metadata as per Next.js 14+)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0a0a12' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a12' }
  ],
};

export default function RootLayout({ children }) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "AgonyBeats",
    "url": process.env.NEXT_PUBLIC_SITE_URL || "https://agonybeats.com",
    "logo": {
      "@type": "ImageObject",
      "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://agonybeats.com"}/logo.png`
    },
    "description": "Premium dark space trap beats, futuristic hip-hop instrumentals, and exclusive sound kits.",
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "andreadelfoco5@gmail.com",
      "contactType": "Customer Service"
    },
    "sameAs": [
      "https://instagram.com/andrea_delfoco"
    ]
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          {/* <Suspense fallback={null}>
            <AffiliateTracker />
          </Suspense> */}
          <Navigation />
          <CartSidebar />
          {/* NewsletterPopup removed - discount code shown on registration */}
          {children}
          <Footer />
          <StickyPlayer />
        </Providers>
      </body>
    </html>
  );
}
