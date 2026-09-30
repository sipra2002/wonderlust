const prisma = require('../config/db');

const getFaqs = async (req, res, next) => {
  try {
    const { destinationId, category, q } = req.query;

    const where = {};
    if (destinationId) {
      where.destinationId = destinationId;
    }
    if (category) {
      where.category = category;
    }
    if (q) {
      where.OR = [
        { question: { contains: q } },
        { answer: { contains: q } },
      ];
    }

    const faqs = await prisma.faqItem.findMany({
      where,
      include: {
        destination: { select: { id: true, name: true } },
      },
      orderBy: { id: 'asc' },
    });

    res.json({ success: true, count: faqs.length, data: faqs });
  } catch (error) {
    next(error);
  }
};

const getEmergencyContacts = async (req, res, next) => {
  try {
    const { destinationId } = req.query;

    const where = {};
    if (destinationId) {
      where.destinationId = destinationId;
    }

    const contacts = await prisma.emergencyContact.findMany({
      where,
      include: {
        destination: { select: { id: true, name: true, state: true } },
      },
      orderBy: { serviceType: 'asc' },
    });

    // General national emergency helplines in India
    const nationalHelplines = [
      { serviceType: 'Police Emergency', name: 'National Emergency Response System', phone: '112' },
      { serviceType: 'Medical Ambulance', name: 'National Ambulance Hotline', phone: '108' },
      { serviceType: 'Fire Service', name: 'Fire Control Room', phone: '101' },
      { serviceType: 'Tourist Helpline', name: 'Ministry of Tourism 24/7 Toll-Free Helpline', phone: '1363' },
      { serviceType: 'Women Helpline', name: 'National Commission for Women', phone: '1091' },
    ];

    res.json({
      success: true,
      nationalHelplines,
      destinationContacts: contacts,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFaqs,
  getEmergencyContacts,
};
