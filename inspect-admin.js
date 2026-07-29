const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.user.findUnique({ where: { email: 'admin@luxestay.com' } })
  .then((user) => {
    console.log(JSON.stringify(user, null, 2));
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect().catch(() => {});
  });
