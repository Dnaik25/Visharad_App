import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { getAllClassesMetadata } from '@/lib/data';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Visharad Sahayak',
  description: 'Mukhpath Helper App',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const classesData = await getAllClassesMetadata();

  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex bg-white`}>
        <Sidebar classes={classesData} />
        <main className="flex-1 ml-64 min-h-screen bg-white">
          {children}
        </main>
      </body>
    </html>
  );
}
