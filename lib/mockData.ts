export type PropertyType = 'rent' | 'buy' | 'shortlet';

export interface Property {
    id: string;
    title: string;
    location: string;
    price: number;
    period?: 'year' | 'month' | 'day'; // day for shortlet
    type: PropertyType;
    bedrooms: number;
    bathrooms: number;
    sizeSqM: number;
    description: string;
    images: string[];
    verified: boolean;
    trustScore: number;
    features: string[];
    isNew?: boolean;
}

export const properties: Property[] = [
    {
        id: '1',
        title: 'Luxury 3-Bed Apartment in Ikoyi',
        location: 'Bourdillon Road, Ikoyi, Lagos',
        price: 15000000,
        period: 'year',
        type: 'rent',
        bedrooms: 3,
        bathrooms: 4,
        sizeSqM: 180,
        description: 'A stunning waterfront apartment with state-of-the-art facilities.',
        images: ['/prop1.jpg'],
        verified: true,
        trustScore: 98,
        features: ['Swimming Pool', 'Gym', '24/7 Power', 'Security'],
        isNew: true
    },
    {
        id: '2',
        title: 'Modern Studio Shortlet',
        location: 'Victoria Island, Lagos',
        price: 85000,
        period: 'day',
        type: 'shortlet',
        bedrooms: 1,
        bathrooms: 1,
        sizeSqM: 45,
        description: 'Perfect for business travelers. High-speed internet included.',
        images: ['/prop2.jpg'],
        verified: true,
        trustScore: 95,
        features: ['WiFi', 'Smart TV', 'Housekeeping', 'Workspace'],
    },
    {
        id: '3',
        title: '5-Bedroom Duplex with BQ',
        location: 'Lekki Phase 1, Lagos',
        price: 450000000,
        type: 'buy',
        bedrooms: 5,
        bathrooms: 6,
        sizeSqM: 400,
        description: 'Newly built duplex with premium finishings and ample parking.',
        images: ['https://images.unsplash.com/photo-1600596542815-6007b05ec456?q=80&w=800&auto=format&fit=crop'],
        verified: true,
        trustScore: 92,
        features: ['Cinema', 'Pool', 'BQ', 'Water Treatment'],
        isNew: true
    },
    {
        id: '6',
        title: 'Contemporary Terrace Duplex',
        location: 'Ajah, Lagos',
        price: 85000000,
        type: 'buy',
        bedrooms: 4,
        bathrooms: 4,
        sizeSqM: 250,
        description: 'Modern 4-bedroom terrace in a secure serviced estate.',
        images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop'],
        verified: true,
        trustScore: 88,
        features: ['24/7 Power', 'Gated Estate', 'Playground'],
        isNew: true
    },
    {
        id: '7',
        title: 'Waterfront Mansion',
        location: 'Banana Island, Ikoyi',
        price: 3500000000,
        type: 'buy',
        bedrooms: 7,
        bathrooms: 9,
        sizeSqM: 1200,
        description: 'The pinnacle of luxury. Private jetty, cinema, elevator, and smart home automation.',
        images: ['https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=800&auto=format&fit=crop'],
        verified: true,
        trustScore: 99,
        features: ['Private Jetty', 'Elevator', 'Cinema', 'Automation', 'Pool'],
        isNew: true
    },
    {
        id: '8',
        title: 'Affordable 3-Bed Bungalow',
        location: 'Sangotedo, Lagos',
        price: 45000000,
        type: 'buy',
        bedrooms: 3,
        bathrooms: 3,
        sizeSqM: 150,
        description: 'Perfect starter home for a young family. Spacious compound.',
        images: ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=800&auto=format&fit=crop'],
        verified: true,
        trustScore: 90,
        features: ['Large Compound', 'Secure Area', 'Fitted Kitchen'],
        isNew: false
    },
    {
        id: '9',
        title: 'Luxury 4-Bed Penthouse',
        location: 'Eko Atlantic, Lagos',
        price: 900000000,
        type: 'buy',
        bedrooms: 4,
        bathrooms: 5,
        sizeSqM: 350,
        description: 'Breathtaking ocean views from the 20th floor. World-class amenities.',
        images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop'],
        verified: true,
        trustScore: 96,
        features: ['Ocean View', 'Gym', 'Spa', 'Concierge'],
        isNew: true
    },
    {
        id: '10',
        title: 'Semi-Detached Duplex',
        location: 'Magodo Phase 2, Lagos',
        price: 180000000,
        type: 'buy',
        bedrooms: 4,
        bathrooms: 5,
        sizeSqM: 300,
        description: 'Serene neighborhood with excellent security and constant power.',
        images: ['https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=800&auto=format&fit=crop'],
        verified: true,
        trustScore: 94,
        features: ['Secure', 'Paved Roads', 'Family Friendly'],
        isNew: false
    },
    {
        id: '11',
        title: 'Smart 5-Bed Detached Villa',
        location: 'Guzape, Abuja',
        price: 650000000,
        type: 'buy',
        bedrooms: 5,
        bathrooms: 6,
        sizeSqM: 550,
        description: 'Hilltop mansion with panoramic views of the capital city.',
        images: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?q=80&w=800&auto=format&fit=crop'],
        verified: true,
        trustScore: 97,
        features: ['Hilltop View', 'Smart Home', 'Infinity Pool', 'Garden'],
        isNew: true
    },
    {
        id: '12',
        title: 'Compact 2-Bed Apartment',
        location: 'Yaba, Lagos',
        price: 35000000,
        type: 'buy',
        bedrooms: 2,
        bathrooms: 2,
        sizeSqM: 85,
        description: 'Investment opportunity near Unilag. High rental yield potential.',
        images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800&auto=format&fit=crop'],
        verified: true,
        trustScore: 85,
        features: ['Close to Campus', 'Good Title', 'Serviced'],
        isNew: true
    },
    {
        id: '13',
        title: 'Renovated Colonial House',
        location: 'Old Ikoyi, Lagos',
        price: 1200000000,
        type: 'buy',
        bedrooms: 6,
        bathrooms: 5,
        sizeSqM: 800,
        description: 'A piece of history with massive grounds. Rare find.',
        images: ['https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=800&auto=format&fit=crop'],
        verified: true,
        trustScore: 93,
        features: ['Large Grounds', 'Trees', 'Historic', 'Quiet'],
        isNew: false
    },
    {
        id: '14',
        title: '3-Bed Terrace',
        location: 'Orchid Road, Lekki',
        price: 75000000,
        type: 'buy',
        bedrooms: 3,
        bathrooms: 4,
        sizeSqM: 200,
        description: 'Great value for money in a rapidly developing area.',
        images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800&auto=format&fit=crop'],
        verified: true,
        trustScore: 89,
        features: ['Value', 'Parking', 'Security'],
        isNew: true
    },
    {
        id: '4',
        title: 'Serviced 2-Bed Flat',
        location: 'Yaba, Lagos',
        price: 3500000,
        period: 'year',
        type: 'rent',
        bedrooms: 2,
        bathrooms: 2,
        sizeSqM: 90,
        description: 'Affordable luxury in the heart of the mainland tech hub.',
        images: ['/prop4.jpg'],
        verified: false, // Example of unverified to show UI difference
        trustScore: 70,
        features: ['Serviced', 'Parking', 'Proximity to Unilag'],
    },
    {
        id: '5',
        title: 'Cozy 1-Bed Guesthouse',
        location: 'Maitama, Abuja',
        price: 60000,
        period: 'day',
        type: 'shortlet',
        bedrooms: 1,
        bathrooms: 1,
        sizeSqM: 50,
        description: 'Serene environment, perfect for relaxation.',
        images: ['/prop5.jpg'],
        verified: true,
        trustScore: 99,
        features: ['Garden', 'Quiet', 'Security'],
    }
];
