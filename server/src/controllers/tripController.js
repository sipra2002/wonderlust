const crypto = require('crypto');
const prisma = require('../config/db');

const getMyTrips = async (req, res, next) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { userId: req.user.id },
      include: {
        destination: { select: { id: true, name: true, state: true, images: true } },
        items: { orderBy: [{ day: 'asc' }, { id: 'asc' }] },
      },
      orderBy: { createdAt: 'desc' },
    });

    const parsed = trips.map((t) => ({
      ...t,
      destination: {
        ...t.destination,
        images: JSON.parse(t.destination.images || '[]'),
      },
      totalExpenses: t.items.reduce((sum, item) => sum + item.cost, 0),
    }));

    res.json({ success: true, count: parsed.length, data: parsed });
  } catch (error) {
    next(error);
  }
};

const createTrip = async (req, res, next) => {
  try {
    const { title, destinationId, startDate, endDate, budget = 0 } = req.body;

    const shareToken = crypto.randomBytes(8).toString('hex');

    const trip = await prisma.trip.create({
      data: {
        userId: req.user.id,
        title,
        destinationId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        budget: parseFloat(budget),
        shareToken,
      },
      include: {
        destination: true,
        items: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      data: {
        ...trip,
        destination: {
          ...trip.destination,
          images: JSON.parse(trip.destination.images || '[]'),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getTripById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        destination: true,
        items: { orderBy: [{ day: 'asc' }, { id: 'asc' }] },
        user: { select: { name: true, avatar: true } },
      },
    });

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    // Check ownership or public share
    if (trip.userId !== req.user?.id && !trip.isPublic) {
      return res.status(403).json({ success: false, message: 'Access denied to this private itinerary' });
    }

    const totalExpenses = trip.items.reduce((sum, item) => sum + item.cost, 0);

    res.json({
      success: true,
      data: {
        ...trip,
        destination: {
          ...trip.destination,
          images: JSON.parse(trip.destination.images || '[]'),
        },
        totalExpenses,
      },
    });
  } catch (error) {
    next(error);
  }
};

const addItineraryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { day, timeSlot, activity, location, cost = 0, notes } = req.body;

    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip || trip.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this trip' });
    }

    const item = await prisma.itineraryItem.create({
      data: {
        tripId: id,
        day: parseInt(day, 10),
        timeSlot,
        activity,
        location,
        cost: parseFloat(cost),
        notes,
      },
    });

    res.status(201).json({ success: true, message: 'Activity added to itinerary', data: item });
  } catch (error) {
    next(error);
  }
};

const deleteItineraryItem = async (req, res, next) => {
  try {
    const { id, itemId } = req.params;

    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip || trip.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this trip' });
    }

    await prisma.itineraryItem.delete({ where: { id: itemId } });

    res.json({ success: true, message: 'Activity removed from itinerary' });
  } catch (error) {
    next(error);
  }
};

const toggleTripVisibility = async (req, res, next) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip || trip.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await prisma.trip.update({
      where: { id },
      data: { isPublic: !trip.isPublic },
    });

    res.json({ success: true, isPublic: updated.isPublic, shareToken: updated.shareToken });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyTrips,
  createTrip,
  getTripById,
  addItineraryItem,
  deleteItineraryItem,
  toggleTripVisibility,
};
