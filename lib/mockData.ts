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
        images: ['/prop3.jpg'],
        verified: true,
        trustScore: 92,
        features: ['Cinema', 'Pool', 'BQ', 'Water Treatment'],
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
