import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/providers'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: 'MakaanX - AI Powered Rental Ecosystem | Find Verified Homes in Pakistan',
  description: 'Pakistan\'s most trusted AI-powered rental platform. Discover verified properties, smart pricing, digital agreements, and secure payments. Find your perfect home in Lahore, Karachi, Islamabad, and more.',
  keywords: ['rental', 'property', 'Pakistan', 'Lahore', 'Karachi', 'Islamabad', 'AI', 'verified homes', 'real estate'],
  authors: [{ name: 'MakaanX' }],
  creator: 'MakaanX',
  publisher: 'MakaanX',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://makaanx.pk',
    siteName: 'MakaanX',
    title: 'MakaanX - AI Powered Rental Ecosystem',
    description: 'Pakistan\'s most trusted AI-powered rental platform. Find verified homes with AI trust scoring.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MakaanX - AI Powered Rental Ecosystem',
    description: 'Pakistan\'s most trusted AI-powered rental platform.',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0f' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className={`${inter.variable} ${geistMono.variable} font-sans antialiased`} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
