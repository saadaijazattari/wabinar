import { prismaClient } from './src/lib/prismaClient';

async function checkLiveWebinars() {
  const liveWebinars = await prismaClient.webinar.findMany({
    where: {
      webinarStatus: 'LIVE',
    },
    select: {
      id: true,
      title: true,
      presenterId: true,
      webinarStatus: true,
    }
  });

  console.log('Live Webinars:', JSON.stringify(liveWebinars, null, 2));
  process.exit(0);
}

checkLiveWebinars().catch(err => {
  console.error(err);
  process.exit(1);
});
