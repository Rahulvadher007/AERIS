import { prisma } from '../src/lib/prisma';

async function main() {
  try {
    const count = await prisma.station.count();
    console.log(`✅ Connected. Stations found: ${count}`);
  } catch (error) {
    console.error('Failed to connect:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
