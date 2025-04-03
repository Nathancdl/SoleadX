import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import SideNav from '@/components/SideNav';
import DarkModeProvider from '@/components/DarkModeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Solead X - Clone Twitter simple',
  description: 'Un clone Twitter simple, créé avec Next.js',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.className} min-h-screen text-black bg-gray-100 dark:bg-gray-900 dark:text-white transition-colors duration-300`}>
        <DarkModeProvider>
          <div className="flex flex-col md:flex-row min-h-screen">
            <SideNav />
            <main className="flex-1 main-content md:ml-64 w-full">
              {children}
            </main>
          </div>
        </DarkModeProvider>
      </body>
    </html>
  );
}
