const prisma = require('../config/db');

const getRestaurants = async (req, res, next) => {
  try {
    const { destinationId, search } = req.query;

    const where = {};
    if (destinationId) {
      where.destinationId = destinationId;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { address: { contains: search } },
        { cuisine: { contains: search } },
      ];
    }

    const restaurants = await prisma.restaurant.findMany({
      where,
      include: {
        destination: { select: { id: true, name: true, state: true } },
      },
      orderBy: { rating: 'desc' },
    });

    const parsed = restaurants.map((r) => ({
      ...r,
      cuisine: JSON.parse(r.cuisine || '[]'),
      highlights: JSON.parse(r.highlights || '[]'),
    }));

    res.json({ success: true, count: parsed.length, data: parsed });
  } catch (error) {
    next(error);
  }
};

const getRestaurantById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: { destination: true },
    });

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    res.json({
      success: true,
      data: {
        ...restaurant,
        cuisine: JSON.parse(restaurant.cuisine || '[]'),
        highlights: JSON.parse(restaurant.highlights || '[]'),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRestaurants,
  getRestaurantById,
};
