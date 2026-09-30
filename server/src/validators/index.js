const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['USER', 'VENDOR', 'ADMIN', 'SUPPORT_AGENT']).optional(),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const initiateBookingSchema = z.object({
  roomId: z.string().min(1, 'Room ID is required'),
  hotelId: z.string().min(1, 'Hotel ID is required'),
  checkIn: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid check-in date'),
  checkOut: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid check-out date'),
  guests: z.number().int().min(1).default(1),
  specialRequests: z.string().optional(),
});

const verifyPaymentSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  razorpayOrderId: z.string().optional(),
  razorpayPaymentId: z.string().optional(),
  razorpaySignature: z.string().optional(),
});

const createTripSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  destinationId: z.string().min(1, 'Destination ID is required'),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid start date'),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid end date'),
  budget: z.number().min(0).default(0),
});

const createItineraryItemSchema = z.object({
  day: z.number().int().min(1).default(1),
  timeSlot: z.string().optional(),
  activity: z.string().min(2, 'Activity description is required'),
  location: z.string().optional(),
  cost: z.number().min(0).default(0),
  notes: z.string().optional(),
});

const createTicketSchema = z.object({
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  category: z.enum(['Booking', 'Payment', 'Hotel', 'General']).default('General'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
});

module.exports = {
  registerSchema,
  loginSchema,
  initiateBookingSchema,
  verifyPaymentSchema,
  createTripSchema,
  createItineraryItemSchema,
  createTicketSchema,
};
