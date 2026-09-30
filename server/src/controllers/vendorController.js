const prisma = require('../config/db');

const getVendorDashboard = async (req, res, next) => {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id },
      include: {
        hotels: {
          include: {
            destination: { select: { name: true, state: true } },
            rooms: true,
            bookings: {
              include: {
                user: { select: { name: true, email: true, phone: true } },
                room: { select: { type: true } },
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    }

    let totalVendorRevenue = 0;
    let totalVendorBookings = 0;

    const parsedHotels = vendor.hotels.map((h) => {
      const hotelConfirmed = h.bookings.filter((b) => b.status === 'CONFIRMED');
      const hotelRev = hotelConfirmed.reduce((sum, b) => sum + b.totalAmount, 0);
      totalVendorRevenue += hotelRev;
      totalVendorBookings += h.bookings.length;

      return {
        ...h,
        amenities: JSON.parse(h.amenities || '[]'),
        images: JSON.parse(h.images || '[]'),
        rooms: h.rooms.map((r) => ({
          ...r,
          amenities: JSON.parse(r.amenities || '[]'),
        })),
        revenue: hotelRev,
      };
    });

    res.json({
      success: true,
      data: {
        vendor: {
          id: vendor.id,
          businessName: vendor.businessName,
          verified: vendor.verified,
        },
        stats: {
          totalHotels: parsedHotels.length,
          totalBookings: totalVendorBookings,
          totalRevenue: totalVendorRevenue,
        },
        hotels: parsedHotels,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createHotel = async (req, res, next) => {
  try {
    const { destinationId, name, address, description, pricePerNight, amenities, images, rooms } = req.body;

    let vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id },
    });

    if (!vendor) {
      vendor = await prisma.vendor.create({
        data: {
          userId: req.user.id,
          businessName: `${req.user.name}'s Properties`,
          verified: true,
        },
      });
    }

    const hotel = await prisma.hotel.create({
      data: {
        vendorId: vendor.id,
        destinationId,
        name,
        address,
        description,
        pricePerNight: parseFloat(pricePerNight),
        amenities: JSON.stringify(amenities || ['Free WiFi', 'Air Conditioning', 'Room Service']),
        images: JSON.stringify(
          images || ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80']
        ),
        isApproved: false, // Requires admin approval as per Section 4.8 of PRD
        rooms: {
          create: (rooms || [
            { type: 'Standard Room', price: parseFloat(pricePerNight), capacity: 2, totalRooms: 5, amenities: JSON.stringify(['Queen Bed', 'AC', 'TV']) },
            { type: 'Deluxe Suite', price: parseFloat(pricePerNight) * 1.5, capacity: 3, totalRooms: 3, amenities: JSON.stringify(['King Bed', 'Balcony', 'Minibar']) },
          ]),
        },
      },
      include: {
        destination: true,
        rooms: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Hotel created and submitted for admin approval!',
      data: hotel,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVendorDashboard,
  createHotel,
};
