import { PrismaClient, Role, OrderStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log(' Starting AMIAS Database Seeding...');

  // 1. Seed Initial Admin User & Demo Customer
  const passwordHash = await argon2.hash('Admin123456');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@amias.com' },
    update: {},
    create: {
      email: 'admin@amias.com',
      passwordHash,
      role: Role.ADMIN,
      customerName: 'Carlos Rivas',
      customerPhone: '987654321',
      deliveryAddress: 'Av. Petit Thouars 1850, Dpto 402',
      deliveryDistrict: 'Lince',
      deliveryReference: 'Frente al parque, portón negro',
    },
  });
  console.log(`Admin user seeded: ${admin.email}`);

  // 2. Seed Master Textile Colors
  const colorsData = [
    { name: 'Negro Reactive Special', hexCode: '#0B0B0B' },
    { name: 'Blanco Óptico', hexCode: '#FFFFFF' },
    { name: 'Azul Índigo Reactivo', hexCode: '#1F2937' },
    { name: 'Beige Crudo Vintage', hexCode: '#D8CCC0' },
  ];

  for (const c of colorsData) {
    const existing = await prisma.textileColor.findFirst({ where: { name: c.name } });
    if (!existing) {
      await prisma.textileColor.create({ data: c });
    }
  }
  console.log('Textile Colors seeded');

  // 3. Seed Master Textile Cuts / Silhouettes
  const cutsData = [
    { name: 'Jersey Algodón 20/1 Oversize Boxy', grammageGsm: 240, description: 'Corte streetwear pesado con hombros caídos de alta durabilidad.' },
    { name: 'Jersey Algodón 24/1 Regular Fit', grammageGsm: 200, description: 'Silueta clásica suave e ideal para clima templado.' },
    { name: 'Heavyweight Fleece Hoodie 30/1', grammageGsm: 380, description: 'Polera con capucha pesada de tejido franela reactiva.' },
  ];

  const cuts = [];
  for (const cut of cutsData) {
    let existing = await prisma.textileCut.findFirst({ where: { name: cut.name } });
    if (!existing) {
      existing = await prisma.textileCut.create({ data: cut });
    }
    cuts.push(existing);
  }
  console.log('Textile Cuts seeded');

  // Set admin preferred cut
  await prisma.user.update({
    where: { id: admin.id },
    data: { preferredCutId: cuts[0].id },
  });

  // 4. Seed Master Textile Sizes
  const sizesData = [
    { label: 'S', chestCm: 56, lengthCm: 70, shoulderCm: 22, heightRef: '1.60m - 1.70m' },
    { label: 'M', chestCm: 59, lengthCm: 73, shoulderCm: 23, heightRef: '1.70m - 1.78m' },
    { label: 'L', chestCm: 62, lengthCm: 76, shoulderCm: 24, heightRef: '1.78m - 1.85m' },
    { label: 'XL', chestCm: 65, lengthCm: 79, shoulderCm: 25, heightRef: '1.85m+' },
  ];

  const sizes = [];
  for (const s of sizesData) {
    let existing = await prisma.textileSize.findFirst({ where: { label: s.label } });
    if (!existing) {
      existing = await prisma.textileSize.create({ data: s });
    }
    sizes.push(existing);
  }
  console.log('Textile Sizes seeded');

  // Set admin preferred size
  await prisma.user.update({
    where: { id: admin.id },
    data: { preferredSizeId: sizes[2].id }, // Talla L
  });

  // 5. Seed Master Concert Events / Tours (Giras 2026)
  const eventsData = [
    { name: 'Coldplay - Spheres Tour 2026', venue: 'Estadio Nacional', capacity: 45000, rate: 0.004, eventDate: new Date('2026-10-24T20:00:00.000Z') },
    { name: 'Blink-182 - World Revival Tour', venue: 'Estadio San Marcos', capacity: 35000, rate: 0.004, eventDate: new Date('2026-11-15T21:00:00.000Z') },
    { name: 'The Weeknd - After Hours Tour', venue: 'Estadio Monumental', capacity: 50000, rate: 0.004, eventDate: new Date('2026-12-05T20:00:00.000Z') },
  ];

  const events = [];
  for (const e of eventsData) {
    let existing = await prisma.concertEvent.findFirst({ where: { name: e.name } });
    if (!existing) {
      existing = await prisma.concertEvent.create({ data: e });
    }
    events.push(existing);
  }
  console.log('Concert Events seeded');

  // 6. Seed Demo Garments / Products (Prendas de Catálogo - US-03 & US-04)
  const productsData = [
    {
      name: 'Polo Oversize Spheres Tour',
      description: 'Merch oficial confeccionado en algodón reactivo 24/1 pesado con estampa DTF.',
      basePrice: 55.0,
      concertEventId: events[0].id,
      cutId: cuts[0].id,
    },
    {
      name: 'Polo Boxy Revival Blink',
      description: 'Estampa frontal y trasera edición limitada World Revival Tour.',
      basePrice: 50.0,
      concertEventId: events[1].id,
      cutId: cuts[0].id,
    },
    {
      name: 'Polo Acid After Hours Vintage',
      description: 'Acabado vintage teñido en tono crudo con caída streetwear.',
      basePrice: 60.0,
      concertEventId: events[2].id,
      cutId: cuts[1].id,
    },
  ];

  const products = [];
  for (const p of productsData) {
    let existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (!existing) {
      existing = await prisma.product.create({
        data: {
          ...p,
          isActive: true,
          sizes: {
            create: sizes.map((s) => ({
              size: { connect: { id: s.id } },
            })),
          },
        },
      });
    }
    products.push(existing);
  }
  console.log('Demo Catalog Products seeded');

  // 7. Seed Demo Orders across all 3 Concert Events and Confection Stages
  // Order 1: #ORD-1082 (Active IN_CUTTING for Carlos Rivas - Coldplay)
  await prisma.order.create({
    data: {
      orderNumber: '#ORD-1082',
      customerName: 'Carlos Rivas',
      customerPhone: '987654321',
      totalAmount: 55.0,
      status: OrderStatus.IN_CUTTING,
      userId: admin.id,
      items: {
        create: [
          {
            productId: products[0].id,
            sizeId: sizes[2].id, // Talla L
            quantity: 1,
            unitPrice: 55.0,
          },
        ],
      },
      paymentReceipt: {
        create: {
          operationCode: '089764',
          fileHash: 'sha256_demo_1082',
          receiptUrl: '/uploads/receipts/demo_voucher_1082.jpg',
        },
      },
    },
  });

  // Order 2: #ORD-1081 (Active CONFIRMED for Lucía Martínez - Blink-182)
  await prisma.order.create({
    data: {
      orderNumber: '#ORD-1081',
      customerName: 'Lucía Martínez',
      customerPhone: '912345678',
      totalAmount: 50.0,
      status: OrderStatus.CONFIRMED,
      items: {
        create: [
          {
            productId: products[1].id,
            sizeId: sizes[1].id, // Talla M
            quantity: 1,
            unitPrice: 50.0,
          },
        ],
      },
      paymentReceipt: {
        create: {
          operationCode: '089765',
          fileHash: 'sha256_demo_1081',
          receiptUrl: '/uploads/receipts/demo_voucher_1081.jpg',
        },
      },
    },
  });

  // Order 3: #ORD-1083 (Active DTF_PRINTING for Mateo Castro - The Weeknd)
  await prisma.order.create({
    data: {
      orderNumber: '#ORD-1083',
      customerName: 'Mateo Castro',
      customerPhone: '987111222',
      totalAmount: 60.0,
      status: OrderStatus.DTF_PRINTING,
      items: {
        create: [
          {
            productId: products[2].id,
            sizeId: sizes[3].id, // Talla XL
            quantity: 1,
            unitPrice: 60.0,
          },
        ],
      },
      paymentReceipt: {
        create: {
          operationCode: '089766',
          fileHash: 'sha256_demo_1083',
          receiptUrl: '/uploads/receipts/demo_voucher_1083.jpg',
        },
      },
    },
  });

  // Order 4: #ORD-1080 (Completed Delivered Order for Carlos Rivas)
  await prisma.order.create({
    data: {
      orderNumber: '#ORD-1080',
      customerName: 'Carlos Rivas',
      customerPhone: '987654321',
      totalAmount: 50.0,
      status: OrderStatus.COMPLETED,
      userId: admin.id,
      items: {
        create: [
          {
            productId: products[1].id,
            sizeId: sizes[2].id, // Talla L
            quantity: 1,
            unitPrice: 50.0,
          },
        ],
      },
      paymentReceipt: {
        create: {
          operationCode: '089763',
          fileHash: 'sha256_demo_1080',
          receiptUrl: '/uploads/receipts/demo_voucher_1080.jpg',
        },
      },
    },
  });

  console.log('Demo Orders seeded across all concert events and stages!');
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
