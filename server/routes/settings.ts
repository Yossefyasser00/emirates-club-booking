import { Router, Request, Response } from 'express';
import prisma from '../prisma.js';

const router = Router();

// GET settings
router.get('/', async (req: Request, res: Response) => {
  try {
    let settings = await prisma.setting.findUnique({ where: { id: 'global' } });
    if (!settings) {
      settings = await prisma.setting.create({
        data: {
          id: 'global',
          clubName: 'cLub ⚽︎ مجمع الملاعب الكروية',
          vodafoneCashNumber: '01099887766',
          instaPayHandle: 'cLub.stadium@instapay',
          depositPercentage: 30,
          fixedDepositAmount: 100,
          useFixedDeposit: true,
          openHour: 10,
          closeHour: 26,
          cancellationHoursLimit: 6,
          autoApprove: false,
          announcement: '🌟 مرحباً بكم في cLub! خصم 20% على حجوزات الملاعب السباعية بكود: CLUB2026',
        },
      });
    }
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT update settings (Admin)
router.put('/', async (req: Request, res: Response) => {
  try {
    const {
      clubName,
      vodafoneCashNumber,
      instaPayHandle,
      depositPercentage,
      fixedDepositAmount,
      useFixedDeposit,
      openHour,
      closeHour,
      cancellationHoursLimit,
      autoApprove,
      announcement,
      footballCategoryTitle,
      footballCategoryDesc,
      footballCategoryImage,
      padelCategoryTitle,
      padelCategoryDesc,
      padelCategoryImage,
    } = req.body;

    const settings = await prisma.setting.upsert({
      where: { id: 'global' },
      update: {
        ...(clubName ? { clubName } : {}),
        ...(vodafoneCashNumber !== undefined ? { vodafoneCashNumber } : {}),
        ...(instaPayHandle !== undefined ? { instaPayHandle } : {}),
        ...(depositPercentage !== undefined ? { depositPercentage: Number(depositPercentage) } : {}),
        ...(fixedDepositAmount !== undefined ? { fixedDepositAmount: Number(fixedDepositAmount) } : {}),
        ...(useFixedDeposit !== undefined ? { useFixedDeposit: Boolean(useFixedDeposit) } : {}),
        ...(openHour !== undefined ? { openHour: Number(openHour) } : {}),
        ...(closeHour !== undefined ? { closeHour: Number(closeHour) } : {}),
        ...(cancellationHoursLimit !== undefined ? { cancellationHoursLimit: Number(cancellationHoursLimit) } : {}),
        ...(autoApprove !== undefined ? { autoApprove: Boolean(autoApprove) } : {}),
        ...(announcement !== undefined ? { announcement } : {}),
        ...(footballCategoryTitle !== undefined ? { footballCategoryTitle } : {}),
        ...(footballCategoryDesc !== undefined ? { footballCategoryDesc } : {}),
        ...(footballCategoryImage !== undefined ? { footballCategoryImage } : {}),
        ...(padelCategoryTitle !== undefined ? { padelCategoryTitle } : {}),
        ...(padelCategoryDesc !== undefined ? { padelCategoryDesc } : {}),
        ...(padelCategoryImage !== undefined ? { padelCategoryImage } : {}),
      },
      create: {
        id: 'global',
        clubName: clubName || 'cLub ⚽︎ مجمع الملاعب الكروية',
        vodafoneCashNumber: vodafoneCashNumber || '01099887766',
        instaPayHandle: instaPayHandle || 'cLub.stadium@instapay',
        depositPercentage: Number(depositPercentage) || 30,
        fixedDepositAmount: Number(fixedDepositAmount) || 100,
        useFixedDeposit: useFixedDeposit !== undefined ? Boolean(useFixedDeposit) : true,
        openHour: Number(openHour) || 10,
        closeHour: Number(closeHour) || 26,
        cancellationHoursLimit: Number(cancellationHoursLimit) || 6,
        autoApprove: Boolean(autoApprove),
        announcement: announcement || null,
        footballCategoryTitle: footballCategoryTitle || 'ملاعب كرة القدم (خماسي وسباعي)',
        footballCategoryDesc: footballCategoryDesc || '4 ملاعب متطورة (سانتياغو، ويمبلي، كامب نو، الأنفيلد) مجهزة بنجيل تركي معتمد FIFA، إضاءة ليلية LED، غرف تبديل وتكييف.',
        footballCategoryImage: footballCategoryImage || '/football-pitch.jpg',
        padelCategoryTitle: padelCategoryTitle || 'ملعب بادل تنس بانوراما (Padel Court)',
        padelCategoryDesc: padelCategoryDesc || 'ملعب بادل زجاجي بانورامي كامل بمواصفات إيطالية عالمية، مع أرضيات Mondo معتمدة، مضارب وكرات مجانية وكافيه ومشروبات VIP.',
        padelCategoryImage: padelCategoryImage || '/padel-blue.jpg',
      },
    });

    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;