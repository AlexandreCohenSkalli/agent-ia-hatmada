import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { id: 'cmmtdnqck00007gy1fks5x795' },
    update: {},
    create: {
      id: 'cmmtdnqck00007gy1fks5x795',
      email: 'alexandre.cohen-skalli@dauphine.eu',
      name: 'Alexandre Cohen',
      password: '$2a$10$oU7DZVtcDadEPVFLiE12yOTlLC06uHn5qf2iQTU4xUSFiGcHb6NhO',
      approved: true,
    },
  });
  console.log('✅ User migré dans Supabase !');
}

main().catch(console.error).finally(() => prisma.$disconnect());
