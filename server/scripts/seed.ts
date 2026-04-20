import dotenv from 'dotenv';
import connectDB from '../config/db';
import ProductModel from '../models/Product';
import mongoose from 'mongoose';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    const productsData = [
  // ===== GENERATOR =====
  {
    name: 'Silent Diesel Generator 5KVA',
    slug: 'silent-diesel-generator-5kva',
    category: 'generators',
    brand: 'Generic',
    type: 'Silent Diesel',
    price: 145000,
    description: 'Reliable 5KVA silent diesel generator for home and office backup.',
    specs: {
      power: '5KVA',
      fuel: 'Diesel',
      runtime: '8hrs',
      cooling: 'Air cooled'
    },
    stock: 10,
    images: [
      { type: 'url', url: 'https://res.cloudinary.com/duxnsu61a/image/upload/v1775035152/dc1_njza16.jpg' },
      { type: 'url', url: 'https://res.cloudinary.com/duxnsu61a/image/upload/v1775035077/dc2_rbbsin.jpg' },
      { type: 'url', url: 'https://res.cloudinary.com/duxnsu61a/image/upload/v1775034987/dc3_rbvnvl.jpg' }
    ],
    featured: true,
    rating: 4.7,
    tags: ['generator', 'diesel', 'silent']
  },

  // ===== SECOND GENERATOR =====
  {
    name: 'Portable Petrol Generator 3.5KVA',
    slug: 'portable-petrol-generator-3-5kva',
    category: 'generators',
    brand: 'Generic',
    type: 'Petrol',
    price: 65000,
    description: 'Portable petrol generator suitable for small businesses and homes.',
    specs: {
      power: '3.5KVA',
      fuel: 'Petrol',
      runtime: '6hrs'
    },
    stock: 15,
    images: [
      { type: 'url', url: 'https://res.cloudinary.com/duxnsu61a/image/upload/v1742330765/Products/srqnvt7iy2vkwu6hikii.jpg' },
      { type: 'url', url: 'https://res.cloudinary.com/duxnsu61a/image/upload/v1742230190/Avatar/vljcqyv7tqm40tqgzfin.jpg' }
    ],
    rating: 4.5,
    tags: ['generator', 'portable']
  },

  // ===== PUMP =====
  {
    name: 'Submersible Water Pump 1HP',
    slug: 'submersible-water-pump-1hp',
    category: 'pumps',
    brand: 'Generic',
    type: 'Submersible',
    price: 28500,
    description: 'High efficiency submersible pump for boreholes and wells.',
    specs: {
      power: '1HP',
      flowRate: '120L/min',
      head: '80m'
    },
    stock: 20,
    images: [
      { type: 'url', url: 'https://res.cloudinary.com/duxnsu61a/image/upload/v1742328845/Products/nqklmruanqlspsbxw8v2.jpg' }
    ],
    rating: 4.4,
    tags: ['pump', 'water']
  },

  // ===== SOLAR PANEL =====
  {
    name: '410W Solar Panel',
    slug: '410w-solar-panel',
    category: 'solar-panels',
    brand: 'Q-Cells',
    type: 'Monocrystalline',
    price: 18500,
    description: 'High efficiency 410W solar panel ideal for residential solar systems.',
    specs: {
      power: '410W',
      efficiency: '20%',
      type: 'Mono',
      warranty: '25 years'
    },
    stock: 50,
    images: [
      { type: 'url', url: 'https://res.cloudinary.com/duxnsu61a/image/upload/v1775047621/410_Q-PEAK-DUO-BLK-G10-All-Black-Solar-Panel_600x600_facado.webp' }
    ],
    featured: true,
    rating: 4.8,
    tags: ['solar', 'panel']
  },

  // ===== INVERTER =====
  {
    name: 'Hybrid Solar Inverter 3KVA',
    slug: 'hybrid-solar-inverter-3kva',
    category: 'inverters',
    brand: 'Generic',
    type: 'Hybrid',
    price: 75000,
    description: '3KVA hybrid inverter supporting solar, grid, and battery.',
    specs: {
      power: '3KVA',
      voltage: '24V',
      type: 'Hybrid'
    },
    stock: 12,
    images: [
      { type: 'url', url: 'https://images.unsplash.com/photo-1581091870627-3c6a8b5f9c3d?w=400' }
    ],
    rating: 4.6,
    tags: ['inverter', 'solar']
  },

  // ===== BATTERY =====
  {
    name: '200Ah Deep Cycle Battery',
    slug: '200ah-deep-cycle-battery',
    category: 'batteries',
    brand: 'Generic',
    type: 'Lead Acid',
    price: 32000,
    description: 'Long lasting deep cycle battery for solar backup systems.',
    specs: {
      capacity: '200Ah',
      voltage: '12V',
      type: 'Lead Acid'
    },
    stock: 25,
    images: [
      { type: 'url', url: 'https://images.unsplash.com/photo-1602526217033-4c9e0b2e8e9b?w=400' }
    ],
    rating: 4.5,
    tags: ['battery']
  },

  // ===== CONTROLLER =====
  {
    name: 'MPPT Solar Charge Controller 60A',
    slug: 'mppt-solar-controller-60a',
    category: 'controllers',
    brand: 'Generic',
    type: 'MPPT',
    price: 18500,
    description: 'Efficient MPPT charge controller for solar systems.',
    specs: {
      current: '60A',
      voltage: '12V/24V',
      type: 'MPPT'
    },
    stock: 18,
    images: [
      { type: 'url', url: 'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?w=400' }
    ],
    rating: 4.7,
    tags: ['controller']
  },

  // ===== EXTRA PRODUCT 1 =====
  {
    name: 'Lithium Battery 5KWh',
    slug: 'lithium-battery-5kwh',
    category: 'batteries',
    brand: 'Generic',
    type: 'Lithium',
    price: 180000,
    description: 'High performance lithium battery for solar storage.',
    specs: {
      capacity: '5KWh',
      voltage: '48V'
    },
    stock: 7,
    images: [
      { type: 'url', url: 'https://images.unsplash.com/photo-1611259188334-2c3d6c7bdbd3?w=400' }
    ],
    rating: 4.9,
    tags: ['battery', 'lithium']
  },

  // ===== EXTRA PRODUCT 2 =====
  {
    name: 'Surface Water Pump 2HP',
    slug: 'surface-water-pump-2hp',
    category: 'pumps',
    brand: 'Generic',
    type: 'Surface',
    price: 42000,
    description: 'Durable 2HP surface pump for irrigation.',
    specs: {
      power: '2HP',
      flowRate: '200L/min'
    },
    stock: 10,
    images: [
      { type: 'url', url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400' }
    ],
    rating: 4.3,
    tags: ['pump']
  },

  // ===== EXTRA PRODUCT 3 =====
  {
    name: 'Pure Sine Wave Inverter 5KVA',
    slug: 'pure-sine-inverter-5kva',
    category: 'inverters',
    brand: 'Generic',
    type: 'Pure Sine',
    price: 120000,
    description: 'High efficiency pure sine inverter for sensitive electronics.',
    specs: {
      power: '5KVA',
      output: 'Pure Sine Wave'
    },
    stock: 9,
    images: [
      { type: 'url', url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400' }
    ],
    rating: 4.8,
    tags: ['inverter']
  }
];

    let createdCount = 0;
    let skippedCount = 0;

    for (const productData of productsData) {
      const exists = await ProductModel.findOne({ slug: productData.slug });

      if (exists) {
        skippedCount++;
        console.log(`⏭️ Skipped: ${productData.name}`);
        continue;
      }

      await new ProductModel(productData).save();
      createdCount++;
      console.log(`✅ Created: ${productData.name}`);
    }

    console.log('\n🎉 SEEDING COMPLETE!');
    console.log(`📦 Products: ${createdCount} created, ${skippedCount} skipped`);

  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 DB connection closed');
    process.exit(0);
  }
};

seedData();