import { PrismaClient, ProductCategory, RequestStatus, SellerStatus } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial verified sellers and test request...');

  // 1. Create Verified Seller
  const seller = await prisma.seller.upsert({
    where: { whatsappNumber: '+2348123456789' },
    update: {},
    create: {
      businessName: 'TechPort Hub',
      contactName: 'Emmanuel Adeyemi',
      whatsappNumber: '+2348123456789',
      telegramHandle: 'techport_emmanuel',
      verificationStatus: SellerStatus.VERIFIED,
      categories: [ProductCategory.LAPTOPS, ProductCategory.PHONES],
      rating: 4.9,
      completedDeals: 38,
      notes: 'Verified campus laptop vendor. Specializes in clean US-used ThinkPads and MacBooks with testing warranty.',
    },
  });

  console.log(`Created verified seller: ${seller.businessName} (ID: ${seller.id})`);

  // 2. Create Sample Buyer Request
  const request = await prisma.buyerRequest.upsert({
    where: { publicToken: 'REQ-8492' },
    update: {},
    create: {
      publicToken: 'REQ-8492',
      buyerName: 'Alex Daniel',
      buyerPhone: '+2348101234567',
      buyerEmail: 'alex.daniel@campus.edu',
      category: ProductCategory.LAPTOPS,
      targetSpecs: {
        brand: 'Lenovo',
        preferredModel: 'ThinkPad T14 or T490',
        minRam: '16GB',
        minStorage: '512GB SSD',
        useCase: 'Software Engineering / Docker',
      },
      minBudget: 300000,
      maxBudget: 420000,
      status: RequestStatus.OFFERS_READY,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    },
  });

  console.log(`Created sample request: ${request.publicToken} for ${request.buyerName}`);

  // 3. Create Sample Offer
  const offer = await prisma.offer.create({
    data: {
      requestId: request.id,
      sellerId: seller.id,
      brand: 'Lenovo',
      model: 'ThinkPad T14 Gen 1',
      specs: {
        cpu: 'Intel Core i7-10510U',
        ram: '16GB DDR4',
        storage: '512GB NVMe SSD',
        batteryHealth: '88% (4.5 hours capacity)',
        screen: '14.0" FHD IPS',
        chargerIncluded: true,
      },
      price: 360000,
      isNegotiable: true,
      conditionGrade: 'Grade A - Pristine',
      cloudinaryPhotos: [
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80',
      ],
      aiConfidenceScore: 0.94,
      reviewStatus: 'AUTO_APPROVED',
      isPublishedToBuyer: true,
      isBuyerSelected: false,
    },
  });

  console.log(`Created candidate offer: ${offer.brand} ${offer.model} at ₦${offer.price}`);
  console.log('Seeding complete! 🚀');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
