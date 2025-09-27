// prisma/seed.js
const bcrypt = require('bcryptjs');
const prisma = require('../prismaClient');

async function main() {
  console.log('Seeding started...');

  // Passwords: must follow your rule (8-16, at least one uppercase, one special char)
  const adminPassword = bcrypt.hashSync('Admin@1234', 10);
  const ownerPassword = bcrypt.hashSync('Owner@1234', 10);
  const userPassword = bcrypt.hashSync('User@1234', 10);

  // 1) Create System Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'System Administrator SeedName', // >=20 chars
      email: 'admin@example.com',
      password: adminPassword,
      address: 'Admin Address Seed',
      role: 'SYSTEM_ADMIN',
    },
  });
  console.log('Created admin:', admin.email);

  // 2) Create Store Owner
  const owner = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: {
      name: 'Store Owner SeedUsernameXXX', // >=20 chars
      email: 'owner@example.com',
      password: ownerPassword,
      address: 'Owner Address Seed',
      role: 'STORE_OWNER',
    },
  });
  console.log('Created owner:', owner.email);

  // 3) Create Normal User
  const normalUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      name: 'Normal User SeedFullNameXYZ', // >=20 chars
      email: 'user@example.com',
      password: userPassword,
      address: 'User Address Seed',
      role: 'NORMAL_USER',
    },
  });
  console.log('Created user:', normalUser.email);

  // 4) Create sample stores (one owned, one not)
  // Use findFirst/create instead of upsert because 'name' is not unique.
  let store1 = await prisma.store.findFirst({
    where: { name: 'Green Grocery Seed' },
  });
  if (!store1) {
    store1 = await prisma.store.create({
      data: {
        name: 'Green Grocery Seed',
        email: 'greengrocer@seed.com',
        address: '123 Market Lane, City',
        ownerId: owner.id, // using the owner created above
      },
    });
  }

  let store2 = await prisma.store.findFirst({
    where: { name: 'Blue Bakery Seed' },
  });
  if (!store2) {
    store2 = await prisma.store.create({
      data: {
        name: 'Blue Bakery Seed',
        email: 'bluebakery@seed.com',
        address: '45 Bakery Road, City',
        ownerId: null,
      },
    });
  }

  console.log('Created stores:', store1.name, ',', store2.name);

  // 5) Create a rating by normal user for store1 (to have sample rating)
  // This uses upsert via the unique constraint uniq_user_store (works)
  await prisma.rating.upsert({
    where: {
      uniq_user_store: {
        userId: normalUser.id,
        storeId: store1.id,
      },
    },
    update: { score: 4, comment: 'Nice produce' },
    create: {
      score: 4,
      comment: 'Nice produce',
      userId: normalUser.id,
      storeId: store1.id,
    },
  });

  console.log('Added a sample rating.');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
