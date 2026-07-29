const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.$connect()
  .then(() => {
    console.log('DB_CONNECTED');
  })
  .catch((e) => {
    console.error('DB_CONNECTION_FAILED');
    console.error(e.message);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect().catch(() => {});
  });
