require('dotenv').config();
const prisma = require('./prismaClient');
const { answerQuestion } = require('./services/ragService');

async function runTests() {
  try {
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } }) || await prisma.user.findFirst();
    if (!admin) throw new Error('No admin user found');

    console.log('--- Test 1: Question clearly answerable from policy ---');
    // I know from previous test pipeline we uploaded a dummy PDF with text: 
    // "Dummy Test Policy Document" and "This is the second page of the test policy with some extra text so it gets chunked properly."
    let res1 = await answerQuestion({
      question: 'What is the dummy document called and what is on the second page?',
      source: 'policy',
      userId: admin.id
    });
    console.log('Answer:', res1.answer);
    console.log('Grounded:', res1.grounded);
    console.log('Citations:', res1.citations.length);
    if (res1.citations.length > 0) {
      console.log('Top similarity:', res1.citations[0].similarityScore);
    }
    
    console.log('\n--- Test 2: Question NOT covered by any policy ---');
    let res2 = await answerQuestion({
      question: 'What is the recipe for a chocolate cake according to the government?',
      source: 'policy',
      userId: admin.id
    });
    console.log('Answer:', res2.answer);
    console.log('Grounded:', res2.grounded);
    console.log('Citations:', res2.citations.length);

    console.log('\n--- Test 3: Vague/broad question ---');
    let res3 = await answerQuestion({
      question: 'document policy',
      source: 'policy',
      userId: admin.id
    });
    console.log('Answer:', res3.answer);
    console.log('Grounded:', res3.grounded);
    console.log('Citations:', res3.citations.length);

    console.log('\n--- Test 4: Reject tenderId not belonging to user ---');
    try {
      await answerQuestion({
        question: 'Any tender question',
        source: 'tender',
        tenderId: 'fake-tender-id',
        userId: admin.id
      });
      console.log('FAILURE: Should have thrown error for fake tender');
    } catch (err) {
      console.log('SUCCESS: Caught expected error for tender ownership:', err.message);
    }

  } catch (err) {
    console.error('Test script failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
