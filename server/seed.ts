import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('⚽ Seeding cLub Football Platform...');

  // 1. Settings
  await prisma.setting.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      clubName: 'cLub ⚽︎ مجمع الملاعب الكروية',
      vodafoneCashNumber: '01099887766',
      instaPayHandle: 'cLub.stadium@instapay',
      depositPercentage: 30,
      fixedDepositAmount: 100,
      useFixedDeposit: true,
      openHour: 10,  // 10:00 AM
      closeHour: 26, // 02:00 AM
      cancellationHoursLimit: 6,
      autoApprove: false,
      announcement: '🌟 مرحباً بكم في cLub! خصم 20% على حجوزات الملاعب السباعية بكود: CLUB2026',
    },
  });

  // 2. Default Courts (2 Five-a-side, 2 Seven-a-side)
  const courtsData = [
    {
      name: 'ملعب سانتياغو (خماسي 1)',
      type: 'FIVE_A_SIDE',
      pricePerHour: 250,
      peakPricePerHour: 300,
      description: 'ملعب خماسي VIP مجهز بأحدث نجيل صناعي تركي FIFA Quality، إضاءة ليد ناصعة، غرف تبديل وتكييف.',
      image: 'https://images.unsplash.com/photo-1529900245534-47fbf82a60e1?auto=format&fit=crop&w=1200&q=80',
      features: 'نجيل تركي معتمد, إضاءة ليد احترافية, كرات وأقماع مجاناً, غرف تبديل ملابس مكيفة, مياه باردة, كافتيريا',
      isActive: true,
    },
    {
      name: 'ملعب ويمبلي (خماسي 2)',
      type: 'FIVE_A_SIDE',
      pricePerHour: 230,
      peakPricePerHour: 280,
      description: 'ملعب خماسي فخم ومحاط بشباك حماية عالية الأمان مع مقاعد مخصصة للبدلاء ومكبرات صوت.',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
      features: 'أرضية عالية الجودة, نظام صوتي, لوحة نتائج إلكترونية, إضاءة ليلية, كرات أصلية',
      isActive: true,
    },
    {
      name: 'ملعب كامب نو (سباعي 1)',
      type: 'SEVEN_A_SIDE',
      pricePerHour: 400,
      peakPricePerHour: 480,
      description: 'ملعب سباعي بمساحة أولمبية شاسعة، مناسب للمباريات الكبيرة والبطولات مع مدرج صغير للجمهور.',
      image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1200&q=80',
      features: 'مساحة سباعي واسعة, مدرج جماهيري, تصوير فيديو للمباريات (حسب الطلب), كرات واقماع وفستات مجاناً, إضاءة كاشفة قوية',
      isActive: true,
    },
    {
      name: 'ملعب الأنفيلد (سباعي 2)',
      type: 'SEVEN_A_SIDE',
      pricePerHour: 380,
      peakPricePerHour: 450,
      description: 'ملعب سباعي متميز بعشب سوفت وتصريف مياه ممتاز وأجواء كروية حماسية لا تُنسى.',
      image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
      features: 'عشب عالي النعومة, غرف استحمام, حكام عند الطلب, كافتيريا ومشروبات, إنترنت واي فاي سريع',
      isActive: true,
    },
  ];

  const createdCourts = [];
  for (const court of courtsData) {
    const existing = await prisma.court.findFirst({ where: { name: court.name } });
    if (!existing) {
      const c = await prisma.court.create({ data: court });
      createdCourts.push(c);
    } else {
      createdCourts.push(existing);
    }
  }

  // 3. Promo Codes
  const promoCodes = [
    {
      code: 'CLUB2026',
      discountPercent: 20,
      discountAmount: 0,
      minBookingHours: 1,
      maxUses: 200,
      usedCount: 14,
      isActive: true,
    },
    {
      code: 'GOAL50',
      discountPercent: 0,
      discountAmount: 50,
      minBookingHours: 2,
      maxUses: 100,
      usedCount: 8,
      isActive: true,
    },
    {
      code: 'WEEKEND15',
      discountPercent: 15,
      discountAmount: 0,
      minBookingHours: 1,
      maxUses: 50,
      usedCount: 5,
      isActive: true,
    },
  ];

  for (const promo of promoCodes) {
    await prisma.promoCode.upsert({
      where: { code: promo.code },
      update: {},
      create: promo,
    });
  }

  // 4. Sample Bookings
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  if (createdCourts.length > 0) {
    const sampleBookings = [
      {
        bookingCode: 'CLUB-1001',
        courtId: createdCourts[0].id,
        customerName: 'كابتن أحمد سامي',
        customerPhone: '01011223344',
        customerEmail: 'ahmed.sami@example.com',
        date: today,
        startTime: '19:00',
        endTime: '20:00',
        durationHours: 1,
        totalAmount: 300,
        depositAmount: 100,
        discountAmount: 0,
        status: 'CONFIRMED',
        notes: 'مباراة دوري الأصدقاء',
      },
      {
        bookingCode: 'CLUB-1002',
        courtId: createdCourts[0].id,
        customerName: 'محمود حسن',
        customerPhone: '01122334455',
        customerEmail: 'mahmoud@example.com',
        date: today,
        startTime: '21:00',
        endTime: '23:00',
        durationHours: 2,
        totalAmount: 600,
        depositAmount: 200,
        discountAmount: 50,
        promoCode: 'GOAL50',
        status: 'CONFIRMED',
        notes: 'حجز ساعتين متتاليتين',
      },
      {
        bookingCode: 'CLUB-1003',
        courtId: createdCourts[2].id,
        customerName: 'فريق النسور (كابتن تامر)',
        customerPhone: '01234567890',
        customerEmail: 'tamer@example.com',
        date: today,
        startTime: '20:00',
        endTime: '22:00',
        durationHours: 2,
        totalAmount: 960,
        depositAmount: 250,
        discountAmount: 0,
        status: 'PENDING',
        notes: 'محول عن طريق فودافون كاش - في انتظار مراجعة الإيصال',
      },
    ];

    for (const b of sampleBookings) {
      const existing = await prisma.booking.findUnique({ where: { bookingCode: b.bookingCode } });
      if (!existing) {
        const createdB = await prisma.booking.create({ data: b });
        await prisma.payment.create({
          data: {
            bookingId: createdB.id,
            method: b.status === 'PENDING' ? 'VODAFONE_CASH' : 'INSTAPAY',
            amount: b.depositAmount,
            transactionReference: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
            status: b.status === 'CONFIRMED' ? 'VERIFIED' : 'PENDING_VERIFICATION',
            receiptImage: '',
          },
        });
      }
    }
  }

  // 5. Sample Complaint
  const sampleComplaint = {
    ticketNumber: 'CMP-8812',
    customerName: 'طارق عبد الله',
    customerPhone: '01055667788',
    bookingCode: 'CLUB-1001',
    subject: 'طلب توفير كرات إضافية بمقاس 5',
    message: 'الملعب ممتاز جداً والإضاءة ممتازة، نرجو توفير كرات مقاس 5 إضافية عند غرف التبديل.',
    status: 'NEW',
  };

  const existingComp = await prisma.complaint.findUnique({ where: { ticketNumber: sampleComplaint.ticketNumber } });
  if (!existingComp) {
    await prisma.complaint.create({ data: sampleComplaint });
  }

  console.log('✅ Database seeded successfully with 4 courts, settings, promo codes, and sample bookings!');
}

main()
  .catch((e) => {
    console.error('Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });