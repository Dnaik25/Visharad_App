import Link from 'next/link';
import { getAllClassesMetadata } from '@/lib/data';
import { ArrowRight, BookOpen } from 'lucide-react';

export default async function Home() {
  const classes = await getAllClassesMetadata();
  let startLink = '/';

  if (classes.length > 0 && classes[0].shloks.length > 0) {
    const firstClassId = classes[0].filename.match(/(\d+)/)?.[0] || '1';
    const firstShlokId = classes[0].shloks[0];
    startLink = `/class/${firstClassId}/shlok/${firstShlokId}`;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="bg-blue-50 p-4 rounded-full mb-6">
        <BookOpen size={48} className="text-blue-600" />
      </div>

      <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
        Visharad Sahayak
      </h1>

      <p className="text-xl text-gray-600 max-w-md mb-10 leading-relaxed">
        Study support for Visharad classes. Browse classes and shloks comfortably on any device.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href={startLink}
          className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
        >
          Start Studying
          <ArrowRight className="ml-2" size={20} />
        </Link>
      </div>
    </div>
  );
}
