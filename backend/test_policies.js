require('dotenv').config();
const prisma = require('./prismaClient');

async function test() {
  const policies = await prisma.policy.findMany();
  console.log("Policies:", policies.map(p => ({ id: p.id, title: p.title, status: p.status, category: p.category })));
}
test().catch(console.error).finally(() => prisma.$disconnect());
