const prisma = require('../config/db');

const getAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalVendors = await prisma.vendor.count();
    const totalHotels = await prisma.hotel.count();
    const totalBookings = await prisma.booking.count();

    const confirmedBookings = await prisma.booking.findMany({
      where: { status: 'CONFIRMED' },
      select: { totalAmount: true },
    });

    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.totalAmount, 0);

    const pendingHotels = await prisma.hotel.count({ where: { isApproved: false } });
    const approvedHotels = await prisma.hotel.count({ where: { isApproved: true } });
    const openTickets = await prisma.ticket.count({ where: { status: 'OPEN' } });
    const resolvedTickets = await prisma.ticket.count({ where: { status: 'RESOLVED' } });

    const recentBookings = await prisma.booking.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true, avatar: true } },
        hotel: { select: { name: true, destination: { select: { name: true } } } },
        room: { select: { type: true, price: true } },
        payment: { select: { status: true } },
      },
    });

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalBookings,
        totalUsers,
        totalVendors,
        totalHotels,
        approvedHotels,
        pendingHotels,
        openTickets,
        resolvedTickets,
        recentBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getPendingHotels = async (req, res, next) => {
  try {
    const hotels = await prisma.hotel.findMany({
      where: { isApproved: false },
      include: {
        destination: { select: { name: true, state: true } },
        vendor: { select: { businessName: true, contactEmail: true, verified: true } },
        rooms: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const parsed = hotels.map((h) => ({
      ...h,
      amenities: JSON.parse(h.amenities || '[]'),
      images: JSON.parse(h.images || '[]'),
    }));

    res.json({ success: true, count: parsed.length, data: parsed });
  } catch (error) {
    next(error);
  }
};

const getAllHotels = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    const where = {};
    if (status === 'pending') where.isApproved = false;
    else if (status === 'approved') where.isApproved = true;

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
        destination: { select: { name: true, state: true } },
        vendor: { select: { businessName: true, contactEmail: true, verified: true } },
        rooms: true,
        _count: { select: { bookings: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const parsed = hotels.map((h) => ({
      ...h,
      amenities: JSON.parse(h.amenities || '[]'),
      images: JSON.parse(h.images || '[]'),
    }));

    res.json({ success: true, count: parsed.length, data: parsed });
  } catch (error) {
    next(error);
  }
};

const updateHotelApproval = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const updated = await prisma.hotel.update({
      where: { id },
      data: { isApproved: Boolean(isApproved) },
    });

    res.json({
      success: true,
      message: `Hotel ${isApproved ? 'approved' : 'rejected'} successfully`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

const getAllBookings = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    const where = {};
    if (status && status !== 'all') where.status = status;

    if (search) {
      where.OR = [
        { bookingNumber: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
        { hotel: { name: { contains: search } } },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
        hotel: { select: { id: true, name: true, address: true, destination: { select: { name: true, state: true } } } },
        room: { select: { id: true, type: true, price: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        payment: true,
      },
    });

    res.json({ success: true, message: `Booking status updated to ${status}`, data: updated });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;

    const where = {};
    if (role && role !== 'all') where.role = role;

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        createdAt: true,
        vendorProfile: {
          select: {
            id: true,
            businessName: true,
            verified: true,
            contactEmail: true,
            contactPhone: true,
            _count: { select: { hotels: true } },
          },
        },
        _count: {
          select: {
            bookings: true,
            trips: true,
            tickets: true,
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['USER', 'VENDOR', 'ADMIN', 'SUPPORT_AGENT'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    res.json({ success: true, message: `User role changed to ${role}`, data: updated });
  } catch (error) {
    next(error);
  }
};

const toggleVendorVerification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;

    const updated = await prisma.vendor.update({
      where: { id },
      data: { verified: Boolean(verified) },
    });

    res.json({
      success: true,
      message: `Vendor verification set to ${verified}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

const getAllTickets = async (req, res, next) => {
  try {
    const { status } = req.query;

    const where = {};
    if (status && status !== 'all') where.status = status;

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, role: true, avatar: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ success: true, count: tickets.length, data: tickets });
  } catch (error) {
    next(error);
  }
};

const updateTicketStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, assignedAgentId } = req.body;

    const updated = await prisma.ticket.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(assignedAgentId && { assignedAgentId }),
      },
    });

    res.json({ success: true, message: 'Ticket updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalytics,
  getPendingHotels,
  getAllHotels,
  updateHotelApproval,
  getAllBookings,
  updateBookingStatus,
  getAllUsers,
  updateUserRole,
  toggleVendorVerification,
  getAllTickets,
  updateTicketStatus,
};

