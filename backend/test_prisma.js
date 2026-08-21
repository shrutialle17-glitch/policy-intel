const prisma = require('./prismaClient');
console.log(Object.keys(prisma._dmmf.modelMap.TenderDocument.fields.map(f => f.name)));
console.log(prisma._dmmf.modelMap.TenderDocument.fields.map(f => f.name));
