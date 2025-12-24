import { redirect } from 'next/navigation';
import { getAllClassesMetadata } from '@/lib/data';

export default async function Home() {
  const classes = await getAllClassesMetadata();
  if (classes.length > 0 && classes[0].shloks.length > 0) {
    const firstClassId = classes[0].filename.match(/(\d+)/)?.[0] || '1';
    const firstShlokId = classes[0].shloks[0];
    redirect(`/class/${firstClassId}/shlok/${firstShlokId}`);
  }

  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-gray-500">No classes found. Please add Class data.</p>
    </div>
  );
}
