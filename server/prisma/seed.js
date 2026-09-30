const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing records in reverse dependency order
  await prisma.ticketMessage.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.itineraryItem.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.review.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.room.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.faqItem.deleteMany();
  await prisma.emergencyContact.deleteMany();
  await prisma.destination.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Demo Users
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const traveler = await prisma.user.create({
    data: {
      name: 'Aarav Sharma',
      email: 'traveler@example.com',
      passwordHash,
      role: 'USER',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    },
  });

  const vendorUser = await prisma.user.create({
    data: {
      name: 'Vikramaditya Singhania',
      email: 'vendor@example.com',
      passwordHash,
      role: 'VENDOR',
      phone: '+91 98111 22334',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    },
  });

  const vendorProfile = await prisma.vendor.create({
    data: {
      userId: vendorUser.id,
      businessName: 'Heritage Luxury Escapes India',
      verified: true,
      contactEmail: 'partner@heritageluxury.in',
      contactPhone: '+91 98111 22334',
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: 'Pooja Verma (Admin)',
      email: 'admin@example.com',
      passwordHash,
      role: 'ADMIN',
      phone: '+91 99999 88888',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    },
  });

  const supportAgent = await prisma.user.create({
    data: {
      name: 'Devika Nair (Support)',
      email: 'support@example.com',
      passwordHash,
      role: 'SUPPORT_AGENT',
      phone: '+91 88888 77777',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    },
  });

  console.log('✅ Demo Users created (password: Password123!)');

  // 3. Destinations
  const goa = await prisma.destination.create({
    data: {
      name: 'Goa',
      state: 'Goa',
      country: 'India',
      category: 'beach',
      description: 'Sun-kissed coastline, golden beaches, vibrant beach shacks, Portuguese colonial architecture, and lively water sports.',
      bestTimeToVisit: 'October to March',
      weatherTemp: '28°C',
      weatherCondition: 'Sunny & Tropical',
      latitude: 15.2993,
      longitude: 74.1240,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1587922546307-776227941871?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
      ]),
    },
  });

  const manali = await prisma.destination.create({
    data: {
      name: 'Manali',
      state: 'Himachal Pradesh',
      country: 'India',
      category: 'hill_station',
      description: 'Nestled amidst soaring snow-capped Pir Panjal peaks, dense pine forests, bubbling Beas River, and thrilling adventure trails.',
      bestTimeToVisit: 'April to June & Dec to Feb (Snow)',
      weatherTemp: '12°C',
      weatherCondition: 'Crisp Mountain Breeze',
      latitude: 32.2396,
      longitude: 77.1887,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1593181629936-11c609b8db9b?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1586370434639-0fe43b2d32e6?auto=format&fit=crop&w=1200&q=80',
      ]),
    },
  });

  const jaipur = await prisma.destination.create({
    data: {
      name: 'Jaipur',
      state: 'Rajasthan',
      country: 'India',
      category: 'heritage',
      description: 'The iconic Pink City famous for majestic Amber Fort, the honeycomb facade of Hawa Mahal, royal palaces, and vibrant bazaars.',
      bestTimeToVisit: 'October to March',
      weatherTemp: '24°C',
      weatherCondition: 'Pleasant & Sunny',
      latitude: 26.9124,
      longitude: 75.7873,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1603288940314-daee1c210d73?auto=format&fit=crop&w=1200&q=80',
      ]),
    },
  });

  const rishikesh = await prisma.destination.create({
    data: {
      name: 'Rishikesh',
      state: 'Uttarakhand',
      country: 'India',
      category: 'adventure',
      description: 'The Yoga Capital of the World on the foothills of the Himalayas. Renowned for Grade-IV white water rafting, bungee jumping, and evening Ganga Aarti.',
      bestTimeToVisit: 'September to November & March to May',
      weatherTemp: '21°C',
      weatherCondition: 'Clear Skies',
      latitude: 30.0869,
      longitude: 78.2676,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1598460677461-9c869ebf16a0?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      ]),
    },
  });

  const munnar = await prisma.destination.create({
    data: {
      name: 'Munnar',
      state: 'Kerala',
      country: 'India',
      category: 'hill_station',
      description: 'Endless rolling emerald green tea estates, misty mountain slopes, fragrant cardamom hills, and scenic waterfalls in God’s Own Country.',
      bestTimeToVisit: 'September to March',
      weatherTemp: '18°C',
      weatherCondition: 'Misty & Refreshing',
      latitude: 10.0889,
      longitude: 77.0595,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80',
      ]),
    },
  });

  const udaipur = await prisma.destination.create({
    data: {
      name: 'Udaipur',
      state: 'Rajasthan',
      country: 'India',
      category: 'heritage',
      description: 'The City of Lakes, Venice of the East with shimmering Lake Pichola, towering marble palaces, and unforgettable sunsets.',
      bestTimeToVisit: 'October to March',
      weatherTemp: '23°C',
      weatherCondition: 'Clear & Regal',
      latitude: 24.5854,
      longitude: 73.7125,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1582650625119-3a31f8418b7d?auto=format&fit=crop&w=1200&q=80',
      ]),
    },
  });

  console.log('✅ 6 Destinations seeded');

  // 4. Hotels & Rooms
  // Goa Hotels
  const tajGoa = await prisma.hotel.create({
    data: {
      vendorId: vendorProfile.id,
      destinationId: goa.id,
      name: 'Taj Exotica Resort & Spa',
      address: 'Calwaddo, Benaulim Beach, South Goa 403716',
      description: 'Spread across 56 manicured lush acres along the pristine Benaulim coastline. Mediterranean-style resort with signature Jiva Spa, private plunge pools, and fine dining.',
      rating: 4.9,
      pricePerNight: 16500,
      amenities: JSON.stringify(['Private Beach', 'Infinity Pool', 'Jiva Luxury Spa', 'Free High-Speed WiFi', 'Airport Shuttle', 'Fine Dining Restaurants', 'Kids Play Zone']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
      ]),
      isApproved: true,
      rooms: {
        create: [
          {
            type: 'Deluxe Garden Villa',
            price: 16500,
            capacity: 2,
            amenities: JSON.stringify(['King Bed', 'Private Balcony', 'Deep Soaking Tub', 'Espresso Machine']),
            image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
          },
          {
            type: 'Luxury Sea View Villa with Plunge Pool',
            price: 28000,
            capacity: 3,
            amenities: JSON.stringify(['Private Plunge Pool', 'Panoramic Arabian Sea View', 'Butler Service', 'Complimentary Champagne']),
            image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
          },
        ],
      },
    },
  });

  const wGoa = await prisma.hotel.create({
    data: {
      destinationId: goa.id,
      name: 'W Goa - Vagator Beach',
      address: 'Vagator Beach, Bardez, North Goa 403509',
      description: 'Perched over dramatic red cliffs overlooking Vagator Beach. High-energy luxury with Rock Pool sunsets, vibrant beats, and bespoke contemporary rooms.',
      rating: 4.8,
      pricePerNight: 14200,
      amenities: JSON.stringify(['Rock Pool', 'FIT Gym', 'Away Spa', 'Pet Friendly', 'Cocktail Lounge', 'Beach Access']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
      ]),
      isApproved: true,
      rooms: {
        create: [
          {
            type: 'Fabulous Room with Garden Terrace',
            price: 14200,
            capacity: 2,
            amenities: JSON.stringify(['W Signature Bed', 'Terrace', 'Rainforest Shower']),
            image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
          },
          {
            type: 'Marvelous Sea-Facing Suite',
            price: 24500,
            capacity: 4,
            amenities: JSON.stringify(['Balcony Sunset View', 'Living Lounge', 'Bar Counter']),
            image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
          },
        ],
      },
    },
  });

  // Manali Hotels
  const himalayanManali = await prisma.hotel.create({
    data: {
      destinationId: manali.id,
      name: 'The Himalayan Luxury Castle Resort',
      address: 'Hadimba Road, Manali, Himachal Pradesh 175131',
      description: 'A grand Victorian Gothic-style castle surrounded by cherry orchards and apple groves. Features heated outdoor pool overlooking snow-clad peaks.',
      rating: 4.9,
      pricePerNight: 11800,
      amenities: JSON.stringify(['Heated Outdoor Pool', 'Fireplace in Room', 'Snow View Balconies', 'Spa & Wellness', 'Free Breakfast']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      ]),
      isApproved: true,
      rooms: {
        create: [
          {
            type: 'Castle Chamber with Mountain View',
            price: 11800,
            capacity: 2,
            amenities: JSON.stringify(['Antique Fireplace', 'Hardwood Flooring', 'Snow Panorama']),
            image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
          },
          {
            type: 'Grand Royale Cottage with Attic',
            price: 19500,
            capacity: 4,
            amenities: JSON.stringify(['2 Bedrooms', 'Private Kitchenette', 'Glass Observatory Deck']),
            image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
          },
        ],
      },
    },
  });

  // Jaipur Hotels
  const rambaghJaipur = await prisma.hotel.create({
    data: {
      vendorId: vendorProfile.id,
      destinationId: jaipur.id,
      name: 'Rambagh Palace - The Jewel of Jaipur',
      address: 'Bhawani Singh Road, Jaipur, Rajasthan 302005',
      description: 'Formerly the royal residence of the Maharaja of Jaipur. 47 acres of tranquil royal gardens, marble colonnades, and opulent royal suites.',
      rating: 5.0,
      pricePerNight: 32000,
      amenities: JSON.stringify(['Heritage Royal Suites', 'Indoor & Outdoor Pools', 'Peacock Gardens', 'Royal Butler Service', 'J Wellness Circle Spa']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      ]),
      isApproved: true,
      rooms: {
        create: [
          {
            type: 'Palace Room with Garden Courtyard',
            price: 32000,
            capacity: 2,
            amenities: JSON.stringify(['Hand-painted Frescoes', 'Royal Four-Poster Bed', 'Marble Bath']),
            image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
          },
          {
            type: 'Maharaja Royal Grand Suite',
            price: 65000,
            capacity: 3,
            amenities: JSON.stringify(['Private Verandah', 'Antique Chandeliers', 'Personal Butler']),
            image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
          },
        ],
      },
    },
  });

  // Rishikesh Hotels
  const alohaRishikesh = await prisma.hotel.create({
    data: {
      destinationId: rishikesh.id,
      name: 'Aloha On The Ganges Resort',
      address: 'National Highway 58, Tapovan, Rishikesh, Uttarakhand 249192',
      description: 'Serene cliffside riverfront sanctuary nestled on the banks of Holy River Ganga. Infinity pool overlooking sacred waters, sunrise yoga, and wellness therapies.',
      rating: 4.7,
      pricePerNight: 8500,
      amenities: JSON.stringify(['Ganges River View', 'Infinity Pool', 'Daily Yoga Sessions', 'Ayurvedic Spa', 'Adventure Desk']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
      ]),
      isApproved: true,
      rooms: {
        create: [
          {
            type: 'Superior Ganga View Room',
            price: 8500,
            capacity: 2,
            amenities: JSON.stringify(['River Facing Balcony', 'Tea Maker', 'Air Conditioning']),
            image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
          },
        ],
      },
    },
  });

  // Udaipur Hotels
  const lakePalaceUdaipur = await prisma.hotel.create({
    data: {
      destinationId: udaipur.id,
      name: 'Taj Lake Palace',
      address: 'Pichola, Udaipur, Rajasthan 313001',
      description: 'An iconic floating white marble wonder built in 1746 on Lake Pichola. Accessible only by private motor boat.',
      rating: 4.9,
      pricePerNight: 29000,
      amenities: JSON.stringify(['Boat Transfers', 'Lake Pichola 360 Views', 'Jiva Boat Spa', 'Royal Heritage Dining']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
      ]),
      isApproved: true,
      rooms: {
        create: [
          {
            type: 'Luxury Lake View Room',
            price: 29000,
            capacity: 2,
            amenities: JSON.stringify(['Direct Lake View', 'Carved Wood Furniture', 'Luxury Robes']),
            image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
          },
        ],
      },
    },
  });

  console.log('✅ Hotels & Rooms seeded');

  // 5. Restaurants & Local Cuisine
  await prisma.restaurant.createMany({
    data: [
      {
        destinationId: goa.id,
        name: "Martin's Corner",
        cuisine: JSON.stringify(['Goan Seafood', 'Portuguese-Goan', 'Continental']),
        priceRange: '₹₹',
        rating: 4.8,
        address: 'Binwaddo, Betalbatim, South Goa',
        highlights: JSON.stringify(['Butter Garlic Crab', 'Goan Prawn Curry with Poi', 'Bebinca with Vanilla Ice Cream']),
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
      },
      {
        destinationId: goa.id,
        name: 'Thalassa Greek Taverna',
        cuisine: JSON.stringify(['Greek', 'Mediterranean', 'Seafood Cocktails']),
        priceRange: '₹₹₹',
        rating: 4.7,
        address: 'Vaddy, Siolim, North Goa',
        highlights: JSON.stringify(['Grilled Calamari', 'Spanakopita', 'Sunset Sangria Jug']),
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      },
      {
        destinationId: manali.id,
        name: "Johnson's Cafe & Bar",
        cuisine: JSON.stringify(['Himachali', 'Wood-Fired Italian', 'Trout Specialities']),
        priceRange: '₹₹',
        rating: 4.8,
        address: 'Circuit House Road, Old Manali',
        highlights: JSON.stringify(['Baked Himalayan Rainbow Trout in Almond Butter', 'Wood-Fired Quattro Formaggi Pizza', 'Hot Spiced Apple Cider']),
        image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80',
      },
      {
        destinationId: jaipur.id,
        name: 'Chokhi Dhani Ethnic Village',
        cuisine: JSON.stringify(['Authentic Rajasthani Thali', 'Marwari Specialities']),
        priceRange: '₹₹',
        rating: 4.9,
        address: '12 Miles, Tonk Road, Jaipur',
        highlights: JSON.stringify(['Dal Baati Churma soaked in Pure Desi Ghee', 'Gatte Ki Sabzi', 'Ker Sangri with Bajra Roti']),
        image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
      },
      {
        destinationId: rishikesh.id,
        name: 'The Sitting Elephant',
        cuisine: JSON.stringify(['Sattvic Fine Dining', 'North Indian', 'Organic Bowls']),
        priceRange: '₹₹',
        rating: 4.6,
        address: 'Badrinath Road, Tapovan, Rishikesh',
        highlights: JSON.stringify(['Kumaoni Pahadi Thali', 'Panchamrit Smoothie', 'Wood-Oven Tandoori Chaap']),
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      },
    ],
  });

  console.log('✅ Local restaurants seeded');

  // 6. FaqItems
  await prisma.faqItem.createMany({
    data: [
      {
        destinationId: null,
        category: 'Visa',
        question: 'Do international tourists need an entry visa for India?',
        answer: 'Yes, international travelers require an Indian Visa or e-Visa. India offers convenient 30-day, 1-year, and 5-year online e-Tourist Visas for citizens of over 160 countries. Apply at least 4 business days prior to departure at indianvisaonline.gov.in.',
      },
      {
        destinationId: null,
        category: 'Currency',
        question: 'What currency is used and is digital UPI accepted for tourists?',
        answer: 'The official currency is Indian Rupee (INR - ₹). International cards (Visa, Mastercard, Amex) are widely accepted in hotels, malls, and restaurants. International tourists can also obtain UPI One World digital wallet at major international airports.',
      },
      {
        destinationId: null,
        category: 'Transport',
        question: 'How do I safely commute locally within Indian cities?',
        answer: 'Use app-based cabs like Uber and Ola for transparent meter pricing. In tourist hubs like Goa, two-wheeler rentals (scooters) and self-drive cars are available upon presenting a valid driving license.',
      },
      {
        destinationId: goa.id,
        category: 'Culture',
        question: 'What is the dress code for Goan beaches and heritage churches?',
        answer: 'Beachwear (swimsuits, shorts) is welcomed on beaches and resort pools. However, when visiting heritage sites like Basilica of Bom Jesus or Se Cathedral in Old Goa, modest attire covering shoulders and knees is strictly required.',
      },
      {
        destinationId: manali.id,
        category: 'Safety',
        question: 'Is Rohtang Pass permit mandatory for visiting from Manali?',
        answer: 'Yes! Vehicles visiting Rohtang Pass require an online permit issued by Himachal Tourism. Electric and CNG vehicles receive priority quotas. Our concierge or hotel adventure desk can assist in securing day passes.',
      },
    ],
  });

  console.log('✅ FAQs seeded');

  // 7. Emergency Contacts
  await prisma.emergencyContact.createMany({
    data: [
      {
        destinationId: goa.id,
        serviceType: 'Tourist Helpline',
        name: 'Goa Tourism 24/7 Security Helpline',
        phone: '1364',
        address: 'Paryatan Bhavan, Patto, Panaji, Goa',
      },
      {
        destinationId: goa.id,
        serviceType: 'Hospital',
        name: 'Goa Medical College & Hospital (GMC)',
        phone: '+91 832 245 8700',
        address: 'Bambolim, Tiswadi, Goa',
      },
      {
        destinationId: manali.id,
        serviceType: 'Police',
        name: 'Manali Police Station & Himalayan Mountain Rescue',
        phone: '+91 1902 252126',
        address: 'Mall Road, Manali, Himachal Pradesh',
      },
      {
        destinationId: jaipur.id,
        serviceType: 'Hospital',
        name: 'SMS Super-Speciality Hospital',
        phone: '+91 141 251 8222',
        address: 'Jawahar Lal Nehru Marg, Ashok Nagar, Jaipur',
      },
      {
        destinationId: rishikesh.id,
        serviceType: 'Hospital',
        name: 'AIIMS Rishikesh Emergency & Trauma Centre',
        phone: '+91 135 246 2929',
        address: 'Virbhadra Road, Rishikesh, Uttarakhand',
      },
    ],
  });

  console.log('✅ Emergency Contacts seeded');

  // 8. Sample Trip with Itinerary Items
  const sampleTrip = await prisma.trip.create({
    data: {
      userId: traveler.id,
      destinationId: goa.id,
      title: 'Serene Sunset & Spice Trail Goa',
      startDate: new Date('2026-11-10'),
      endDate: new Date('2026-11-13'),
      budget: 45000,
      isPublic: true,
      shareToken: 'trip_goa_sunshine_2026',
      items: {
        create: [
          {
            day: 1,
            timeSlot: 'Morning',
            activity: 'Check-in at Taj Exotica & private beach walk along Benaulim sands',
            location: 'Benaulim Beach, South Goa',
            cost: 16500,
            notes: 'Enjoy welcome coconut water and sea breeze.',
          },
          {
            day: 1,
            timeSlot: 'Evening',
            activity: 'Candlelight seafood dinner at Martins Corner',
            location: 'Betalbatim',
            cost: 2800,
            notes: 'Try the butter garlic crab.',
          },
          {
            day: 2,
            timeSlot: 'Morning',
            activity: 'Historical walk through Fontainhas Latin Quarter & Portuguese villas',
            location: 'Panaji',
            cost: 1200,
            notes: 'Wear comfortable walking shoes and bring camera for pastel alleys.',
          },
          {
            day: 2,
            timeSlot: 'Afternoon',
            activity: 'Organic Spice Plantation tour with traditional Goan buffet on banana leaf',
            location: 'Ponda',
            cost: 1800,
            notes: 'Learn about vanilla, black pepper, and cardamom plants.',
          },
        ],
      },
    },
  });

  // 9. Sample Confirmed Booking
  const sampleRoom = await prisma.room.findFirst({ where: { hotelId: tajGoa.id } });
  if (sampleRoom) {
    const booking = await prisma.booking.create({
      data: {
        bookingNumber: 'BK-789012-A8F1',
        userId: traveler.id,
        hotelId: tajGoa.id,
        roomId: sampleRoom.id,
        checkIn: new Date('2026-11-10'),
        checkOut: new Date('2026-11-13'),
        guests: 2,
        totalAmount: 58410,
        status: 'CONFIRMED',
        specialRequests: 'High floor garden view, celebration cake for anniversary',
        payment: {
          create: {
            razorpayOrderId: 'order_seed_demo_78901',
            razorpayPaymentId: 'pay_seed_demo_998877',
            razorpaySignature: 'simulated_valid_signature_hash',
            amount: 58410,
            currency: 'INR',
            status: 'SUCCESS',
          },
        },
      },
    });
    console.log('✅ Sample confirmed booking created:', booking.bookingNumber);
  }

  // 10. Sample Support Ticket
  await prisma.ticket.create({
    data: {
      ticketNumber: 'TICK-445566',
      userId: traveler.id,
      subject: 'Early check-in request for Taj Exotica Goa',
      description: 'Our flight lands at Dabolim Airport at 8:30 AM. Can we request an early check-in or luggage drop-off before 2 PM?',
      category: 'Hotel',
      priority: 'MEDIUM',
      status: 'OPEN',
      messages: {
        create: [
          {
            senderId: traveler.id,
            senderName: traveler.name,
            senderRole: 'USER',
            message: 'Our flight lands at Dabolim Airport at 8:30 AM. Can we request an early check-in or luggage drop-off before 2 PM?',
          },
        ],
      },
    },
  });

  console.log('🎉 Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
