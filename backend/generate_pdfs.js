const PDFDocument = require('pdfkit');
const fs = require('fs');

function createPolicyPDF() {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream('multi_page_policy.pdf'));

  doc.fontSize(25).text('National Procurement Data Security Policy 2026', 100, 100);
  doc.fontSize(12).text('\n\n\n\n\n1. Scope and Application\nThis policy applies to all vendors supplying cloud software and data hosting services to federal agencies. Any software processing citizen data must adhere to strict encryption and location requirements.');
  
  doc.addPage();
  doc.fontSize(18).text('2. Security Requirements', 100, 100);
  doc.fontSize(12).text('\n\n2.1 Data Encryption\nAll citizen data must be encrypted at rest using AES-256 or higher. Data in transit must use TLS 1.3.');
  doc.text('\n\n2.2 Data Residency\nUnder no circumstances may citizen data be stored outside of the national borders. All physical servers handling this data must be geographically located within the country.');

  doc.addPage();
  doc.fontSize(18).text('3. Compliance and Auditing', 100, 100);
  doc.fontSize(12).text('\n\nVendors must undergo a third-party security audit annually and submit the compliance certificate (SOC 2 Type II or equivalent) to the procurement office.');
  
  doc.end();
  console.log('Created multi_page_policy.pdf');
}

function createTenderPDF() {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream('multi_page_tender.pdf'));

  doc.fontSize(25).text('Tender Proposal: SecureCloud Hosting Solution', 100, 100);
  doc.fontSize(12).text('\n\n\n\n\nPrepared by: Acme Cloud Solutions\nDate: August 2026');
  
  doc.addPage();
  doc.fontSize(18).text('1. Technical Architecture', 100, 100);
  doc.fontSize(12).text('\n\nOur SecureCloud solution provides state-of-the-art hosting. We utilize AES-256 encryption for all databases at rest. For data in transit, we enforce TLS 1.3 across all endpoints, ensuring complete alignment with national data security standards.');

  doc.addPage();
  doc.fontSize(18).text('2. Infrastructure Details', 100, 100);
  // Deliberately missing/ambiguous clause
  doc.fontSize(12).text('\n\nTo ensure high availability and disaster recovery, we utilize a multi-region deployment strategy. Our primary datacenters are located within the national borders, while our backup nodes are distributed across our global network in North America and Europe to guarantee 99.99% uptime.');

  doc.addPage();
  doc.fontSize(18).text('3. Certifications', 100, 100);
  // Deliberately missing SOC 2 Type II
  doc.fontSize(12).text('\n\nAcme Cloud Solutions takes security seriously. We hold ISO 9001 certification for quality management and conduct internal security reviews every six months.');

  doc.end();
  console.log('Created multi_page_tender.pdf');
}

createPolicyPDF();
createTenderPDF();
