import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Sample data for the Product table
  const products = [
    {
      name: 'Laptop',
      quantity: 10,
      unitprice: 1000,
      tax: 100,
      pricewithtax: 1100,
    },
    {
      name: 'Smartphone',
      quantity: 20,
      unitprice: 500,
      tax: 50,
      pricewithtax: 550,
    },
    {
      name: 'Wireless Headphones',
      quantity: 50,
      unitprice: 100,
      tax: 10,
      pricewithtax: 110,
    },
    {
      name: 'Monitor',
      quantity: 15,
      unitprice: 200,
      tax: 20,
      pricewithtax: 220,
    },
    {
      name: 'Keyboard',
      quantity: 30,
      unitprice: 50,
      tax: 5,
      pricewithtax: 55,
    },
  ];

  // Insert sample data into the Product table
  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log('Sample data seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
