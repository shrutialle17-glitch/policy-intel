require('dotenv').config();
const { uploadFile } = require('./services/supabaseService');
async function test() {
  try {
    const url = await uploadFile(Buffer.from('hello world'), 'tenders/test/test.pdf', 'application/pdf');
    console.log('Success:', url);
  } catch (e) {
    console.error('Error:', e);
  }
}
test();
