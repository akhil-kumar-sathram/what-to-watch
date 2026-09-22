import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WHAT TO WATCH — A movie for how you feel',
  description: 'A movie for how you feel. Personalized cinematic movie recommendations based on your mood, day, and emotional state.',
  openGraph: {
    title: 'WHAT TO WATCH — A movie for how you feel',
    description: 'A movie for how you feel. Personalized cinematic movie recommendations based on your mood, day, and emotional state.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..700;1,6..96,400..700&family=Cinzel:wght@400;500;600;700;800;900&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600;1,700&family=Italiana&family=Playfair+Display:ital,wght@0,600;0,700;0,800;0,900;1,600;1,700&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#080A0D] text-[#E5E8E6] antialiased selection:bg-[#3DBFC4]/30 selection:text-[#68E1E5]">
        {children}
      </body>
    </html>
  );
}
