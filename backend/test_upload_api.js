const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
require('dotenv').config();

async function test() {
  try {
    // 1. Login
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@policyintel.gov',
      password: 'admin123'
    });
    const token = loginRes.data.token;
    console.log('Got token');

    // 2. Create dummy PDF
    const pdfContent = '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
    fs.writeFileSync('dummy.pdf', pdfContent);

    // 3. Upload Tender
    const form = new FormData();
    form.append('title', 'Test Tender');
    form.append('file', fs.createReadStream('dummy.pdf'));

    const uploadRes = await axios.post('http://localhost:5000/api/tenders', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Upload success:', uploadRes.data);
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
}

test();
