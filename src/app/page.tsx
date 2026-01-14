import Link from 'next/link';
import Image from 'next/image';
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
    <div className="relative flex flex-col items-center justify-center min-h-[80vh] text-center px-4 rounded-3xl overflow-hidden shadow-2xl mt-2">
      {/* Background Image */}
      {/* Background Image */}
      <Image
        src="/banner.png"
        alt="Visharad Sahayak Banner"
        fill
        className="object-cover object-center z-0"
        priority
      />

      {/* Overlay for readability */}
      <div className="absolute inset-0 z-10 bg-black/50" />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center max-w-2xl mx-auto">
        <div className="p-5 rounded-full mb-8 bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
          <BookOpen size={56} className="text-orange-400" />
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-xl">
          Visharad Sahayak
        </h1>

        <p className="text-xl md:text-2xl text-orange-50 max-w-lg mb-12 leading-relaxed drop-shadow-md font-medium">
          Study support for Vidvāns
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={startLink}
            className="group inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-white bg-red-600 rounded-full hover:bg-red-700 transition-all transform hover:scale-105 shadow-xl shadow-red-900/30"
          >
            Start Studying
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={24} />
          </Link>

          <Link
            href="/quiz"
            className="group inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-red-600 bg-white border-2 border-red-100 rounded-full hover:bg-red-50 transition-all transform hover:scale-105 shadow-lg"
          >
            Take a Quiz
            <BookOpen className="ml-2" size={24} />
          </Link>
        </div>
      </div>
    </div>
  );
}
