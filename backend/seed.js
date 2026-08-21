require('dotenv').config();
const prisma = require('./prismaClient');
const bcrypt = require('bcryptjs');
const { processPolicy } = require('./services/policyProcessingService');
const fs = require('fs');
const { uploadFile } = require('./services/supabaseService');

async function seed() {
  // 1. Create an admin user if not exists
  const adminEmail = 'admin@policyintel.gov';
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'System Admin',
        role: 'ADMIN'
      }
    });
    console.log('Created admin user');
  }

  // 2. Upload policy
  const fileBuffer = fs.readFileSync('multi_page_policy.pdf');
  const fileName = 'multi_page_policy.pdf';
  
  const path = await uploadFile(fileBuffer, fileName, 'application/pdf');
  
  const policy = await prisma.policy.create({
    data: {
      title: 'National Procurement Data Security Policy 2026',
      issuingAuthority: 'Ministry of Data',
      category: 'Security',
      fileUrl: path,
      status: 'PROCESSING',
      uploadedById: admin.id
    }
  });

  console.log('Created policy, processing...');
  
  // 3. Process policy chunks
  await processPolicy(policy.id);
  console.log('Policy processed successfully!');
}

seed().catch(console.error).finally(() => prisma.$disconnect());
