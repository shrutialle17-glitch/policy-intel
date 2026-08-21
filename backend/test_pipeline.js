require('dotenv').config();
const prisma = require('./prismaClient');
const PDFDocument = require('pdfkit');
const { uploadFile } = require('./services/supabaseService');
const { processPolicy } = require('./services/policyProcessingService');

async function runTest() {
  try {
    // 1. Get any user (Admin)
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } }) || await prisma.user.findFirst();
    if (!admin) throw new Error('No user found');

    // 2. Generate a dummy PDF in memory
    const doc = new PDFDocument();
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    
    doc.fontSize(25).text('Dummy Test Policy Document', 100, 100);
    doc.addPage();
    doc.fontSize(15).text('This is the second page of the test policy with some extra text so it gets chunked properly. '.repeat(50));
    doc.end();

    const pdfBuffer = await new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
    });

    // 3. Upload file
    console.log('Uploading PDF to Supabase...');
    const fileUrl = await uploadFile(pdfBuffer, 'test_policy.pdf', 'application/pdf');

    // 4. Create Policy
    console.log('Creating Policy in DB...');
    const policy = await prisma.policy.create({
      data: {
        title: 'Pipeline Test Policy',
        description: 'Test document for pipeline validation',
        category: 'General',
        fileUrl,
        fileSizeBytes: pdfBuffer.length,
        status: 'PROCESSING',
        uploadedById: admin.id
      }
    });

    console.log(`Policy created with ID: ${policy.id}`);

    // 5. Run process
    console.log('Running processPolicy...');
    await processPolicy(policy.id);

    // 6. Verify result
    const updatedPolicy = await prisma.policy.findUnique({ 
      where: { id: policy.id },
      include: { chunks: true }
    });

    console.log('=== TEST RESULTS ===');
    console.log('Status:', updatedPolicy.status);
    console.log('Error Message:', updatedPolicy.errorMessage);
    console.log('Chunk Count:', updatedPolicy.chunks.length);
    if (updatedPolicy.chunks.length > 0) {
       console.log('Sample chunk pageNumber:', updatedPolicy.chunks[0].pageNumber);
    }
    console.log('====================');
    
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
