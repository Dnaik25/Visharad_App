import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { MainLayout } from '@/components/MainLayout';
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
      <body className={inter.className}>
        <MainLayout classes={classesData}>
          {children}
        </MainLayout>
      </body>
    </html>
  );
}
