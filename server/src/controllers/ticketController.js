const crypto = require('crypto');
const prisma = require('../config/db');

const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { userId: req.user.id },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ success: true, count: tickets.length, data: tickets });
  } catch (error) {
    next(error);
  }
};

const createTicket = async (req, res, next) => {
  try {
    const { subject, description, category = 'General', priority = 'MEDIUM' } = req.body;

    const ticketNumber = 'TICK-' + Date.now().toString().slice(-6);

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        userId: req.user.id,
        subject,
        description,
        category,
        priority,
        status: 'OPEN',
        messages: {
          create: {
            senderId: req.user.id,
            senderName: req.user.name,
            senderRole: req.user.role,
            message: description,
          },
        },
      },
      include: {
        messages: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

const getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (ticket.userId !== req.user.id && !['ADMIN', 'SUPPORT_AGENT'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

const addTicketMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty' });
    }

    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (ticket.userId !== req.user.id && !['ADMIN', 'SUPPORT_AGENT'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const newMessage = await prisma.ticketMessage.create({
      data: {
        ticketId: id,
        senderId: req.user.id,
        senderName: req.user.name,
        senderRole: req.user.role,
        message,
      },
    });

    // Update ticket updated timestamp
    await prisma.ticket.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyTickets,
  createTicket,
  getTicketById,
  addTicketMessage,
};
