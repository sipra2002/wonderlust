const prisma = require('../config/db');

const getDestinations = async (req, res, next) => {
  try {
    const { category, search, state } = req.query;

    const where = {};
    if (category && category !== 'all') {
      where.category = category;
    }
    if (state) {
      where.state = { contains: state };
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { state: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const destinations = await prisma.destination.findMany({
      where,
      include: {
        _count: {
          select: { hotels: true, restaurants: true, reviews: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const parsed = destinations.map((d) => ({
      ...d,
      images: JSON.parse(d.images || '[]'),
    }));

    res.json({ success: true, count: parsed.length, data: parsed });
  } catch (error) {
    next(error);
  }
};

const getDestinationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const destination = await prisma.destination.findUnique({
      where: { id },
      include: {
        hotels: {
          where: { isApproved: true },
          include: { rooms: true },
        },
        restaurants: true,
        reviews: {
          include: {
            user: { select: { name: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        faqs: true,
        emergencyContacts: true,
      },
    });

    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    const parsed = {
      ...destination,
      images: JSON.parse(destination.images || '[]'),
      hotels: destination.hotels.map((h) => ({
        ...h,
        amenities: JSON.parse(h.amenities || '[]'),
        images: JSON.parse(h.images || '[]'),
      })),
      restaurants: destination.restaurants.map((r) => ({
        ...r,
        cuisine: JSON.parse(r.cuisine || '[]'),
        highlights: JSON.parse(r.highlights || '[]'),
      })),
    };

    res.json({ success: true, data: parsed });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = [
      { id: 'all', label: 'All Destinations', icon: 'Sparkles', count: 6 },
      { id: 'beach', label: 'Beaches & Coastal', icon: 'Palmtree', count: 2 },
      { id: 'hill_station', label: 'Hill Stations & Mist', icon: 'Mountain', count: 2 },
      { id: 'heritage', label: 'Heritage & Palaces', icon: 'Landmark', count: 2 },
      { id: 'adventure', label: 'Adventure & Rivers', icon: 'Compass', count: 1 },
    ];
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDestinations,
  getDestinationById,
  getCategories,
};
