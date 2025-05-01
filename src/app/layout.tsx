import type { Metadata } from 'next';
import { Noto_Naskh_Arabic } from 'next/font/google'; // Import appropriate Arabic font
import './globals.css';
import { SessionProvider } from 'next-auth/react'; // Import SessionProvider
import { auth } from '@/lib/auth'; // Import auth config
import { Toaster } from "@/components/ui/toaster";
import AppHeader from '@/components/layout/app-header'; // Import AppHeader

// Configure the Arabic font
const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  weight: ['400', '700'], // Include weights you need
  variable: '--font-naskh', // Define CSS variable
});

export const metadata: Metadata = {
  title: 'ديوان العرب | Diwan Al Arab', // Updated title
  description: 'منصة لعشاق الشعر العربي لتسجيل ومشاركة واكتشاف القصائد العربية.', // Arabic description
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth(); // Get session on the server

  return (
    // The SessionProvider doesn't render a DOM element itself,
    // so the <html> tag can be the direct top-level element inside it.
    <SessionProvider session={session}>
      <html lang="ar"> 
        <body className={`${notoNaskhArabic.variable} font-sans antialiased`}> {/* Use font variable */}
          <div className="flex min-h-screen flex-col">
             <AppHeader /> {/* Add the header */}
             <main className="flex-grow container mx-auto px-4 py-8">
               {children}
             </main>
             {/* Optional Footer can go here */}
          </div>
          <Toaster /> {/* Add Toaster for notifications */}
        </body>
      </html>
    </SessionProvider>
  );
}
