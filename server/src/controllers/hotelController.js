const prisma = require('../config/db');

const getHotels = async (req, res, next) => {
  try {
    const { destinationId, minPrice, maxPrice, rating, search } = req.query;

    const where = { isApproved: true };

    if (destinationId) {
      where.destinationId = destinationId;
    }
    if (minPrice || maxPrice) {
      where.pricePerNight = {};
      if (minPrice) where.pricePerNight.gte = parseFloat(minPrice);
      if (maxPrice) where.pricePerNight.lte = parseFloat(maxPrice);
    }
    if (rating) {
      where.rating = { gte: parseFloat(rating) };
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { address: { contains: search } },
        { destination: { name: { contains: search } } },
      ];
    }

    const hotels = await prisma.hotel.findMany({
      where,
      include: {
        destination: { select: { id: true, name: true, state: true } },
        rooms: true,
        _count: { select: { reviews: true } },
      },
      orderBy: { rating: 'desc' },
    });

    const parsed = hotels.map((h) => ({
      ...h,
      amenities: JSON.parse(h.amenities || '[]'),
      images: JSON.parse(h.images || '[]'),
      rooms: h.rooms.map((r) => ({
        ...r,
        amenities: JSON.parse(r.amenities || '[]'),
      })),
    }));

    res.json({ success: true, count: parsed.length, data: parsed });
  } catch (error) {
    next(error);
  }
};

const getHotelById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const hotel = await prisma.hotel.findUnique({
      where: { id },
      include: {
        destination: true,
        rooms: true,
        reviews: {
          include: { user: { select: { name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    const parsed = {
      ...hotel,
      amenities: JSON.parse(hotel.amenities || '[]'),
      images: JSON.parse(hotel.images || '[]'),
      rooms: hotel.rooms.map((r) => ({
        ...r,
        amenities: JSON.parse(r.amenities || '[]'),
      })),
    };

    res.json({ success: true, data: parsed });
  } catch (error) {
    next(error);
  }
};

const addHotelReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await prisma.review.create({
      data: {
        userId: req.user.id,
        hotelId: id,
        rating: parseInt(rating, 10),
        comment,
      },
      include: {
        user: { select: { name: true, avatar: true } },
      },
    });

    // Update average rating
    const allReviews = await prisma.review.findMany({ where: { hotelId: id } });
    const avgRating = (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1);
    await prisma.hotel.update({
      where: { id },
      data: { rating: parseFloat(avgRating) },
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHotels,
  getHotelById,
  addHotelReview,
};
