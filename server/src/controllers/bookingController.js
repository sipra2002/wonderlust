const crypto = require('crypto');
const prisma = require('../config/db');
const razorpayService = require('../services/razorpayService');

const initiateBooking = async (req, res, next) => {
  try {
    const { hotelId, roomId, checkIn, checkOut, guests = 1, specialRequests } = req.body;
    const userId = req.user.id;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    const nights = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));

    // Fetch room to securely calculate price server-side (prevent tampering)
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { hotel: true },
    });

    if (!room || room.hotelId !== hotelId) {
      return res.status(404).json({ success: false, message: 'Selected room not found in hotel' });
    }

    const baseAmount = room.price * nights;
    const taxesAndFees = Math.round(baseAmount * 0.18); // 18% GST standard in India hospitality
    const totalAmount = baseAmount + taxesAndFees;

    const bookingNumber = 'BK-' + Date.now().toString().slice(-6) + '-' + crypto.randomBytes(2).toString('hex').toUpperCase();

    // Create booking record
    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        userId,
        hotelId,
        roomId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests,
        totalAmount,
        status: 'PENDING',
        specialRequests,
      },
      include: {
        hotel: true,
        room: true,
      },
    });

    // Create Razorpay Order
    const order = await razorpayService.createOrder({
      amount: totalAmount,
      currency: 'INR',
      receipt: booking.bookingNumber,
    });

    // Create payment record linked to booking
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        razorpayOrderId: order.id,
        amount: totalAmount,
        currency: 'INR',
        status: 'PENDING',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Booking initialized',
      booking: {
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        totalAmount,
        baseAmount,
        taxesAndFees,
        nights,
        hotelName: booking.hotel.name,
        roomType: booking.room.type,
      },
      razorpay: {
        keyId: razorpayService.keyId,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        simulated: order.simulated,
      },
    });
  } catch (error) {
    next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true, hotel: true, room: true },
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const orderIdToVerify = razorpayOrderId || booking.payment?.razorpayOrderId;
    const paymentId = razorpayPaymentId || ('pay_' + crypto.randomBytes(8).toString('hex'));

    const isValid = razorpayService.verifyPaymentSignature({
      orderId: orderIdToVerify,
      paymentId,
      signature: razorpaySignature,
    });

    if (!isValid) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'FAILED' },
      });
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
      include: {
        hotel: { select: { name: true, address: true, images: true } },
        room: { select: { type: true, price: true } },
        payment: true,
      },
    });

    await prisma.payment.update({
      where: { bookingId },
      data: {
        status: 'SUCCESS',
        razorpayPaymentId: paymentId,
        razorpaySignature: razorpaySignature || 'simulated_valid_signature',
      },
    });

    res.json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking: {
        ...updatedBooking,
        hotel: {
          ...updatedBooking.hotel,
          images: JSON.parse(updatedBooking.hotel.images || '[]'),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
            address: true,
            images: true,
            destination: { select: { name: true, state: true } },
          },
        },
        room: { select: { type: true, price: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const parsed = bookings.map((b) => ({
      ...b,
      hotel: {
        ...b.hotel,
        images: JSON.parse(b.hotel.images || '[]'),
      },
    }));

    res.json({ success: true, count: parsed.length, data: parsed });
  } catch (error) {
    next(error);
  }
};

const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        hotel: { include: { destination: true } },
        room: true,
        payment: true,
        user: { select: { name: true, email: true, phone: true } },
      },
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({
      success: true,
      data: {
        ...booking,
        hotel: {
          ...booking.hotel,
          images: JSON.parse(booking.hotel.images || '[]'),
          amenities: JSON.parse(booking.hotel.amenities || '[]'),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    res.json({ success: true, message: 'Booking cancelled successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  initiateBooking,
  verifyPayment,
  getMyBookings,
  getBookingById,
  cancelBooking,
};
