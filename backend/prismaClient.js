// prismaClient.js
const { PrismaClient } = require('@prisma/client');

const prisma = global.prisma || new PrismaClient();

// Prevent creating new PrismaClient on each HMR reload in dev (nice for nodemon)
if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;
}

module.exports = prisma;
