const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const API_URL = 'http://localhost:5000/api';

async function testEndToEnd() {
  try {
    const ts = Date.now();
    const email = `testuser_${ts}@example.com`;
    console.log('Registering:', email);
    let res = await axios.post(`${API_URL}/auth/register`, { email, password: 'password123', name: 'Test User' });
    const token = res.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log('Asking Policy AI a valid question...');
    res = await axios.post(`${API_URL}/policy-ai/ask`, { question: 'What are the data encryption requirements?' }, { headers });
    console.log('Policy AI Answer:', res.data.data.answer.substring(0, 100));

    console.log('Asking Policy AI a missing question...');
    res = await axios.post(`${API_URL}/policy-ai/ask`, { question: 'Are there any restrictions on AI model sizes?' }, { headers });
    console.log('Policy AI Answer (missing):', res.data.data.answer);

    console.log('Uploading Tender...');
    const form = new FormData();
    form.append('file', fs.createReadStream('multi_page_tender.pdf'));
    form.append('title', 'My Test Tender');
    res = await axios.post(`${API_URL}/tenders`, form, { headers: { ...headers, ...form.getHeaders() } });
    const tenderId = res.data.data.id;
    
    console.log('Waiting for tender processing...');
    let tenderReady = false;
    for (let i = 0; i < 30; i++) {
        const tenderRes = await axios.get(`${API_URL}/tenders/${tenderId}`, { headers });
        if (tenderRes.data.data.status === 'READY') {
            tenderReady = true;
            break;
        } else if (tenderRes.data.data.status === 'FAILED') {
            throw new Error('Tender processing failed');
        }
        await new Promise(r => setTimeout(r, 2000));
    }
    if (!tenderReady) throw new Error('Tender processing timed out');

    console.log('Asking Tender AI...');
    res = await axios.post(`${API_URL}/tenders/${tenderId}/ask`, { question: 'What encryption is used?' }, { headers });
    console.log('Tender AI Answer:', res.data.data.answer.substring(0, 100));

    console.log('Starting Compliance Check...');
    res = await axios.post(`${API_URL}/tenders/${tenderId}/compliance-analysis`, { categories: ['Security'] }, { headers });
    const analysisId = res.data.data.id;

    console.log('Waiting for compliance analysis...');
    let complianceReady = false;
    let analysis;
    for (let i = 0; i < 30; i++) {
        res = await axios.get(`${API_URL}/compliance-analysis/${analysisId}`, { headers });
        analysis = res.data.data;
        if (analysis.status === 'COMPLETED') {
            complianceReady = true;
            break;
        } else if (analysis.status === 'FAILED') {
            throw new Error('Compliance analysis failed');
        }
        await new Promise(r => setTimeout(r, 2000));
    }
    if (!complianceReady) throw new Error('Compliance analysis timed out');
    
    if (!analysis) {
        console.error('Analysis not found in list:', res.data.data, 'Expected:', analysisId);
    }
    console.log(`Findings count: ${analysis.findings.length}`);
    const compliant = analysis.findings.filter(f => f.status === 'COMPLIANT');
    const missing = analysis.findings.filter(f => f.status === 'MISSING');
    const needsReview = analysis.findings.filter(f => f.status === 'NEEDS_REVIEW');
    console.log(`COMPLIANT: ${compliant.length}, MISSING: ${missing.length}, NEEDS_REVIEW: ${needsReview.length}`);

    console.log('E2E Test Completed Successfully');
  } catch (err) {
    console.error('Test failed:', err.response?.data || err.message);
  }
}

testEndToEnd();
