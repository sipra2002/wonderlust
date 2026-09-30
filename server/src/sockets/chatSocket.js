const prisma = require('../config/db');

const setupChatSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket Connected]: ${socket.id}`);

    // Join a specific ticket room
    socket.on('join_ticket', (ticketId) => {
      socket.join(`ticket_${ticketId}`);
      console.log(`Socket ${socket.id} joined ticket_${ticketId}`);
    });

    // Send message inside a ticket room
    socket.on('send_ticket_message', async (data) => {
      const { ticketId, senderId, senderName, senderRole, message } = data;

      try {
        const savedMessage = await prisma.ticketMessage.create({
          data: {
            ticketId,
            senderId,
            senderName,
            senderRole,
            message,
          },
        });

        io.to(`ticket_${ticketId}`).emit('receive_ticket_message', savedMessage);
      } catch (err) {
        console.error('[Socket Error saving ticket message]:', err);
      }
    });

    // Join live tourist assistant chat
    socket.on('join_assistant', (userId) => {
      const roomId = `assistant_${userId || socket.id}`;
      socket.join(roomId);
      
      // Send welcome message
      socket.emit('assistant_message', {
        id: 'msg_welcome',
        sender: 'AI Tourist Guide',
        message: 'Namaste! I am your 24/7 Wanderlust India Tourist Assistant. Ask me about best travel seasons, visa rules, emergency contacts, local customs, or tap below to talk with a live human support agent.',
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('assistant_query', async (data) => {
      const { query, userId } = data;
      const lowerQuery = (query || '').toLowerCase();
      const roomId = `assistant_${userId || socket.id}`;

      let reply = "I can help you with trip planning, hotel bookings, local food recommendations, or emergency assistance. Feel free to ask!";

      if (lowerQuery.includes('visa')) {
        reply = "India offers e-Visa for citizens of over 160 countries across Tourist, Business, and Medical categories. Valid for 30 days to 5 years. Apply at least 4 days prior to arrival at the official portal.";
      } else if (lowerQuery.includes('emergency') || lowerQuery.includes('police') || lowerQuery.includes('hospital')) {
        reply = "EMERGENCY HOTLINES: Dial 112 for all-in-one Police/Fire/Medical response. Tourist Helpline is 1363. You can also view the full Emergency SOS tab on any destination page.";
      } else if (lowerQuery.includes('best time') || lowerQuery.includes('season') || lowerQuery.includes('weather')) {
        reply = "For beaches like Goa: October to March is pleasant. For Himalayas (Manali/Ladakh): May to September for lush green vistas and snow passes. For Rajasthan: October to March provides comfortable royal exploration.";
      } else if (lowerQuery.includes('food') || lowerQuery.includes('eat')) {
        reply = "Explore our dedicated 'Local Food' tab for authentic regional cuisine! From Goan seafood curry to Rajasthani Dal Baati Churma and Himalayan trout, every destination has handpicked local eateries.";
      } else if (lowerQuery.includes('agent') || lowerQuery.includes('human') || lowerQuery.includes('support')) {
        reply = "Connecting you to an available support specialist. Please wait a moment while we dispatch your request to our 24/7 helpdesk.";
      }

      setTimeout(() => {
        io.to(roomId).emit('assistant_message', {
          id: 'msg_' + Date.now(),
          sender: 'AI Tourist Guide',
          message: reply,
          timestamp: new Date().toISOString(),
        });
      }, 600);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket Disconnected]: ${socket.id}`);
    });
  });
};

module.exports = setupChatSocket;
