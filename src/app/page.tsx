import { getAllClassesMetadata } from '@/lib/data';
import { HomeHero } from '@/components/HomeHero';

export default async function Home() {
  const classes = await getAllClassesMetadata();
  let startLink = '/';

  if (classes.length > 0 && classes[0].shloks.length > 0) {
    const firstClassId = classes[0].filename.match(/(\d+)/)?.[0] || '1';
    const firstShlokId = classes[0].shloks[0];
    startLink = `/class/${firstClassId}/shlok/${firstShlokId}`;
  }

  const totalShloks = classes.reduce((sum, c) => sum + c.shloks.length, 0);

  return (
    <HomeHero
      startLink={startLink}
      totalClasses={classes.length}
      totalShloks={totalShloks}
    />
  );
}
