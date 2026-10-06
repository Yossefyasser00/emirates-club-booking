import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function addPadel() {
  const existing = await prisma.court.findFirst({ where: { type: 'PADEL' } });
  if (!existing) {
    const padel = await prisma.court.create({
      data: {
        name: 'ملعب البادل بانوراما (Padel VIP)',
        type: 'PADEL',
        pricePerHour: 300,
        peakPricePerHour: 350,
        description: 'ملعب بادل تنس زجاجي بانورامي فخم مجهز بأحدث أرضيات Mondo الإيطالية، مضارب وكرات مجانية، وإضاءة ليلية متطورة.',
        image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80',
        features: 'زجاج بانورامي كامل, أرضية Mondo إيطالية, مضارب وكرات مجاناً, إضاءة ليلية LED, كافيه ومشروبات VIP',
        isActive: true,
      }
    });
    console.log('Padel court added:', padel.name);
  } else {
    console.log('Padel court already exists:', existing.name);
  }
}

addPadel().finally(() => prisma.$disconnect());