import { Vehicle, Shop, SponsorCoupon, HubXSubscriptionPlan } from '../types';

export const INITIAL_SHOPS: Shop[] = [
  {
    id: 'shop_1',
    name: 'Apex Mobility Indiranagar',
    ownerId: 'user_shop_1',
    address: '100 Feet Road, HAL 2nd Stage, Indiranagar',
    city: 'Bengaluru',
    lat: 12.9784,
    lng: 77.6408,
    isHubX: true,
    hubxPlan: 'Yearly Plan (Active)',
    trialDaysRemaining: 0,
    trustScore: 4.92,
    trustBreakdown: {
      honesty: 99.4,        // 99.4% deposit return without frivolous damage disputes
      vehicleCondition: 98.6,// 15-day certified multi-point mechanical inspection
      punctuality: 99.1,    // Keys ready within 3 minutes of scheduled arrival
      communication: 99.8   // Average chat response under 2 minutes
    },
    totalBookings: 842,
    activeVehicles: 18,
    badge: 'Verified Honest Shop'
  },
  {
    id: 'shop_2',
    name: 'GreenWheels Koramangala',
    ownerId: 'user_shop_2',
    address: '5th Block, near Jyoti Nivas College, Koramangala',
    city: 'Bengaluru',
    lat: 12.9352,
    lng: 77.6245,
    isHubX: true,
    hubxPlan: '1-Month Free Trial',
    trialDaysRemaining: 18,
    trustScore: 4.84,
    trustBreakdown: {
      honesty: 98.8,
      vehicleCondition: 97.4,
      punctuality: 98.0,
      communication: 99.2
    },
    totalBookings: 512,
    activeVehicles: 12,
    badge: 'HubX Prime Partner'
  },
  {
    id: 'shop_3',
    name: 'HSR Throttle & Wheels',
    ownerId: 'user_shop_3',
    address: '27th Main Road, Sector 1, HSR Layout',
    city: 'Bengaluru',
    lat: 12.9121,
    lng: 77.6446,
    isHubX: true,
    hubxPlan: 'Monthly Plan',
    trialDaysRemaining: 0,
    trustScore: 4.78,
    trustBreakdown: {
      honesty: 97.8,
      vehicleCondition: 96.9,
      punctuality: 97.5,
      communication: 98.6
    },
    totalBookings: 320,
    activeVehicles: 9,
    badge: 'Verified Honest Shop'
  }
];

export const INITIAL_VEHICLES: Vehicle[] = [
  // SCOOTIES
  {
    id: 'veh_scooty_1',
    shopId: 'shop_1',
    name: 'Honda Activa 6G Premium',
    category: 'scooty',
    brand: 'Honda',
    year: 2024,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    mileage: '50 kmpl',
    basePrice: 450,
    securityDeposit: 1000,
    rating: 4.9,
    trips: 184,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80',
    videoWalkaround: 'https://assets.mixkit.co/videos/preview/mixkit-motorcycle-parked-on-a-city-street-42512-large.mp4',
    features: ['Combi-Brake System', 'External Fuel Fill', 'LED Headlamp', 'Helmets Included'],
    locationName: 'Indiranagar Metro (0.4 km)',
    dynamicAdjustment: 60,
    surgeReasons: ['Weekend City Leisure Peak (+₹40)', 'Clear Weather (+₹20)']
  },
  {
    id: 'veh_scooty_2',
    shopId: 'shop_1',
    name: 'Ather 450X Gen 3 (Electric)',
    category: 'scooty',
    brand: 'Ather',
    year: 2024,
    fuelType: 'Electric',
    transmission: 'Automatic',
    mileage: '110 km/charge',
    basePrice: 590,
    securityDeposit: 1500,
    rating: 4.95,
    trips: 220,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80',
    videoWalkaround: 'https://assets.mixkit.co/videos/preview/mixkit-motorcycle-parked-on-a-city-street-42512-large.mp4',
    features: ['Touchscreen Navigation', 'Warp Mode 0-40 in 3.3s', 'Portable Fast Charger', 'Reverse Mode'],
    locationName: 'Indiranagar 100ft Rd (0.2 km)',
    dynamicAdjustment: 40,
    surgeReasons: ['High Fleet Demand in Area (+₹40)']
  },
  {
    id: 'veh_scooty_3',
    shopId: 'shop_2',
    name: 'TVS Jupiter 125 Disc',
    category: 'scooty',
    brand: 'TVS',
    year: 2023,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    mileage: '48 kmpl',
    basePrice: 420,
    securityDeposit: 1000,
    rating: 4.82,
    trips: 112,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1558980664-769d59546b3d?auto=format&fit=crop&w=1200&q=80',
    videoWalkaround: 'https://assets.mixkit.co/videos/preview/mixkit-motorcycle-parked-on-a-city-street-42512-large.mp4',
    features: ['Largest Underseat Storage (33L)', 'Front Fuel Cap', 'All-in-one Lock', 'Dual Helmets'],
    locationName: 'Koramangala 5th Block (0.5 km)',
    dynamicAdjustment: 0,
    surgeReasons: []
  },

  // BIKES
  {
    id: 'veh_bike_1',
    shopId: 'shop_1',
    name: 'Royal Enfield Hunter 350 Dapper',
    category: 'bike',
    brand: 'Royal Enfield',
    year: 2024,
    fuelType: 'Petrol',
    transmission: 'Manual 5-Speed',
    mileage: '36 kmpl',
    basePrice: 850,
    securityDeposit: 2500,
    rating: 4.92,
    trips: 145,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1200&q=80',
    videoWalkaround: 'https://assets.mixkit.co/videos/preview/mixkit-motorcycle-parked-on-a-city-street-42512-large.mp4',
    features: ['Dual-channel ABS', 'Tripper Navigation', 'USB Fast Charger', 'Crash Guard + Panniers'],
    locationName: 'Indiranagar BDA Complex (0.6 km)',
    dynamicAdjustment: 90,
    surgeReasons: ['Weekend Getaway Rush (+₹60)', 'Only 1 Remaining in Suburb (+₹30)']
  },
  {
    id: 'veh_bike_2',
    shopId: 'shop_2',
    name: 'Yamaha MT-15 V2 Stealth Black',
    category: 'bike',
    brand: 'Yamaha',
    year: 2024,
    fuelType: 'Petrol',
    transmission: 'Manual 6-Speed',
    mileage: '48 kmpl',
    basePrice: 950,
    securityDeposit: 2500,
    rating: 4.88,
    trips: 98,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80',
    videoWalkaround: 'https://assets.mixkit.co/videos/preview/mixkit-motorcycle-parked-on-a-city-street-42512-large.mp4',
    features: ['Assist & Slipper Clutch', 'USD Front Forks', 'Traction Control', 'Bluetooth Connectivity'],
    locationName: 'Koramangala Sony World (0.3 km)',
    dynamicAdjustment: 50,
    surgeReasons: ['High User Searches in last hour (+₹50)']
  },
  {
    id: 'veh_bike_3',
    shopId: 'shop_3',
    name: 'KTM 250 Duke Dark Galvano',
    category: 'bike',
    brand: 'KTM',
    year: 2024,
    fuelType: 'Petrol',
    transmission: 'Manual 6-Speed',
    mileage: '30 kmpl',
    basePrice: 1200,
    securityDeposit: 3500,
    rating: 4.91,
    trips: 84,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80',
    videoWalkaround: 'https://assets.mixkit.co/videos/preview/mixkit-motorcycle-parked-on-a-city-street-42512-large.mp4',
    features: ['WP APEX Suspension', 'Quickshifter+ Enabled', 'Supermoto ABS Mode', 'TFT Display'],
    locationName: 'HSR 27th Main (0.8 km)',
    dynamicAdjustment: 0,
    surgeReasons: []
  },

  // CARS
  {
    id: 'veh_car_1',
    shopId: 'shop_1',
    name: 'Hyundai i20 Asta Turbo 1.0',
    category: 'car',
    brand: 'Hyundai',
    year: 2023,
    fuelType: 'Petrol',
    transmission: 'Automatic 7-DCT',
    mileage: '18 kmpl',
    basePrice: 1800,
    securityDeposit: 5000,
    rating: 4.89,
    trips: 76,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    videoWalkaround: 'https://assets.mixkit.co/videos/preview/mixkit-white-car-traveling-on-a-curved-mountain-road-42674-large.mp4',
    features: ['Sunroof', 'Wireless Apple CarPlay/Android Auto', 'Cruise Control', 'Fastag Preloaded'],
    locationName: 'Indiranagar 12th Main (0.5 km)',
    dynamicAdjustment: 150,
    surgeReasons: ['Highway Outstation Weekend Surge (+₹150)']
  },
  {
    id: 'veh_car_2',
    shopId: 'shop_2',
    name: 'Mahindra Thar 4x4 Hard Top',
    category: 'car',
    brand: 'Mahindra',
    year: 2024,
    fuelType: 'Diesel',
    transmission: 'Automatic 4WD',
    mileage: '14 kmpl',
    basePrice: 3200,
    securityDeposit: 8000,
    rating: 4.96,
    trips: 62,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
    videoWalkaround: 'https://assets.mixkit.co/videos/preview/mixkit-white-car-traveling-on-a-curved-mountain-road-42674-large.mp4',
    features: ['Mechanical Locking Diff', 'All-Terrain Tyres', 'Roll Cage', 'Convertible Hardtop'],
    locationName: 'Koramangala 80ft Rd (0.7 km)',
    dynamicAdjustment: 250,
    surgeReasons: ['Holiday Offroad Demand (+₹250)']
  },
  {
    id: 'veh_car_3',
    shopId: 'shop_3',
    name: 'Tata Nexon EV Max Dark',
    category: 'car',
    brand: 'Tata',
    year: 2024,
    fuelType: 'Electric',
    transmission: 'Automatic',
    mileage: '400 km/charge',
    basePrice: 2400,
    securityDeposit: 6000,
    rating: 4.94,
    trips: 54,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
    videoWalkaround: 'https://assets.mixkit.co/videos/preview/mixkit-white-car-traveling-on-a-curved-mountain-road-42674-large.mp4',
    features: ['Ventilated Seats', 'Electronic Parking Brake', 'Wireless Charger', 'Free Fast-Charging Pass'],
    locationName: 'HSR BDA Complex (1.1 km)',
    dynamicAdjustment: 0,
    surgeReasons: []
  }
];

export const INITIAL_COUPONS: SponsorCoupon[] = [
  {
    id: 'cpn_1',
    partnerName: 'Taj Hotels & Resorts',
    hotelName: 'Taj West End Bengaluru',
    discountText: '25% Off Luxury Stay + Welcome Drinks',
    couponCode: 'TAJ-RIDEHUB-25',
    validTill: '31 Dec 2026',
    isUnlocked: false,
    tagline: 'Partner Luxury Stay Reward',
    terms: 'Valid on bookings at any participating Taj property across India for RideHub verified riders.'
  },
  {
    id: 'cpn_2',
    partnerName: 'Marriott Bonvoy',
    hotelName: 'JW Marriott Hotel Bengaluru',
    discountText: '₹2,500 Dining Credit with Room Booking',
    couponCode: 'BONVOY-HUBX-2500',
    validTill: '15 Nov 2026',
    isUnlocked: false,
    tagline: 'Fine Dining & Hospitality',
    terms: 'Applicable on dining outlets inside Marriott properties upon showing active RideHub rental confirmation.'
  },
  {
    id: 'cpn_3',
    partnerName: 'Zostel Backpacker Hostels',
    hotelName: 'Zostel Goa / Wayanad / Gokarna',
    discountText: 'Flat 30% Off Private Rooms & Dorms',
    couponCode: 'ZOSTEL-ROADTRIP-30',
    validTill: '28 Feb 2027',
    isUnlocked: true,
    unlockedAt: '2026-09-18T10:30:00Z',
    tagline: 'Adventure & Community Stays',
    terms: 'No minimum booking requirement. Instant unlock for HubX verified long-distance riders.'
  },
  {
    id: 'cpn_4',
    partnerName: 'Treebo Club',
    hotelName: 'Treebo Premium Urban Boutique Hotels',
    discountText: 'Complimentary Room Upgrade & Early Check-in',
    couponCode: 'TREEBO-HUBX-VIP',
    validTill: '30 Oct 2026',
    isUnlocked: false,
    tagline: 'Business & Weekend Getaways',
    terms: 'Subject to room availability at check-in across 120+ Indian cities.'
  }
];

export const HUBX_PLANS: HubXSubscriptionPlan[] = [
  {
    id: 'trial',
    name: '1-Month Free Trial',
    tagline: 'Try every HubX pro feature with zero upfront cost or commitment.',
    pricePerMonth: 0,
    billedPeriodText: 'Free for 30 days, then ₹1,499/mo (Illustrative Pricing)',
    features: [
      'HubX Verified Partner Badge on all listings',
      'Priority rank in search results (+25% views)',
      'Access to AI Demand Forecast & Dynamic Pricing',
      'Hotel sponsor coupon program participation',
      'Instant digital rental agreement generation',
      'Customer damage dispute resolution support'
    ]
  },
  {
    id: 'monthly',
    name: 'Monthly Pro',
    tagline: 'Flexible month-to-month shop growth and intelligence.',
    pricePerMonth: 1499,
    billedPeriodText: 'Billed monthly (Illustrative Pricing)',
    features: [
      'Everything in Free Trial',
      'Up to 25 vehicle listings simultaneously',
      'Weekly Competitor Pricing intelligence feed',
      'Automated dynamic surge pricing triggers',
      'Priority customer roadside assistance link'
    ]
  },
  {
    id: 'half_yearly',
    name: '6-Month Growth',
    tagline: 'Our most popular plan for established suburban rental businesses.',
    pricePerMonth: 1199,
    billedPeriodText: 'Billed ₹7,194 every 6 months (Save 20%)',
    savingsBadge: 'Save 20%',
    isPopular: true,
    features: [
      'Everything in Monthly Pro',
      'Up to 60 vehicle listings',
      'Advanced Kaggle-trained seasonality forecast',
      'Custom weekly pricing calendar automation',
      'Dedicated HubX shop success partner',
      'Premium delivery hub placement'
    ]
  },
  {
    id: 'yearly',
    name: 'Annual Fleet Master',
    tagline: 'Maximum savings and VIP placement across the city.',
    pricePerMonth: 899,
    billedPeriodText: 'Billed ₹10,788 yearly (Save 40%)',
    savingsBadge: 'Best Value (40% Off)',
    features: [
      'Everything in 6-Month Growth',
      'Unlimited vehicle listings & fleet management',
      'City-wide #1 priority search spotlight',
      'Direct API access for fleet telematics',
      'Custom co-branded hotel sponsorship vouchers',
      'Zero dispute commission on damages'
    ]
  }
];
