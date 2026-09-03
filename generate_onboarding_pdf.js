const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

async function generatePdf() {
  console.log('🚀 Starting PDF generation for Binary Froster Client Onboarding Guide...');

  const artifactsDir = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\d674dd5e-8df6-4ba1-aee2-cdef867258c2';
  const mdPath = path.join(artifactsDir, 'client_onboarding_guide.md');
  const screenshotsDir = path.join(artifactsDir, 'screenshots', 'deep_test');
  const outputPdfPath = path.join(__dirname, 'Binary_Froster_Client_Onboarding_Handbook.pdf');
  const outputArtifactPdfPath = path.join(artifactsDir, 'Binary_Froster_Client_Onboarding_Handbook.pdf');

  if (!fs.existsSync(mdPath)) {
    throw new Error(`Markdown file not found at: ${mdPath}`);
  }

  const rawMd = fs.readFileSync(mdPath, 'utf-8');

  // Convert markdown images to base64 inline images
  const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
  let htmlBody = rawMd;

  // Replace images with base64 data URIs inside elegant responsive frames
  htmlBody = htmlBody.replace(imageRegex, (match, caption, imgPath) => {
    try {
      const normalizedPath = imgPath.replace(/\//g, '\\');
      if (fs.existsSync(normalizedPath)) {
        const b64 = fs.readFileSync(normalizedPath).toString('base64');
        return `
          <div class="image-card">
            <div class="image-header">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
              <span class="image-title">// UI CAPTURE: ${caption.toUpperCase()}</span>
            </div>
            <img src="data:image/png;base64,${b64}" alt="${caption}" />
            <div class="image-caption">${caption} — Binary Froster Production Portal</div>
          </div>
        `;
      } else {
        console.warn(`Image not found at path: ${normalizedPath}`);
        return `<p class="missing-image">[Screenshot: ${caption}]</p>`;
      }
    } catch (e) {
      console.error(`Error loading image ${imgPath}:`, e);
      return `<p class="missing-image">[Screenshot: ${caption}]</p>`;
    }
  });

  // Custom Markdown to Clean Semantic HTML parser
  // Headings
  htmlBody = htmlBody.replace(/^### (.*$)/gim, '<h3 class="section-h3">$1</h3>');
  htmlBody = htmlBody.replace(/^## (.*$)/gim, '<h2 class="section-h2">$1</h2>');
  htmlBody = htmlBody.replace(/^# (.*$)/gim, '<h1 class="section-h1">$1</h1>');

  // Blockquotes
  htmlBody = htmlBody.replace(/^\> (.*$)/gim, '<blockquote class="doc-quote">$1</blockquote>');

  // Bold & Italic
  htmlBody = htmlBody.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  htmlBody = htmlBody.replace(/\*(.*?)\*/g, '<em>$1</em>');
  htmlBody = htmlBody.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Tables
  const tableRegex = /\|(.+)\|\n\|[-:\s|]+\|\n((\|.+\|\n?)+)/g;
  htmlBody = htmlBody.replace(tableRegex, (match, headerRow, bodyRows) => {
    const headers = headerRow.split('|').filter(h => h.trim() !== '').map(h => `<th>${h.trim()}</th>`).join('');
    const rows = bodyRows.trim().split('\n').map(row => {
      const cells = row.split('|').filter(c => c.trim() !== '').map(c => `<td>${c.trim()}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    return `<div class="table-container"><table class="data-table"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></div>`;
  });

  // Code blocks
  htmlBody = htmlBody.replace(/```([\s\S]*?)```/g, '<pre class="code-block"><code>$1</code></pre>');

  // Horizontal rules with page breaks
  htmlBody = htmlBody.replace(/^---$/gim, '<hr class="section-divider" />');

  // Unordered lists
  htmlBody = htmlBody.replace(/^\- (.*$)/gim, '<li class="list-item">$1</li>');

  // Wrap consecutive list items in <ul>
  htmlBody = htmlBody.replace(/(<li class="list-item">[\s\S]*?<\/li>)+/g, '<ul class="doc-list">$&</ul>');

  // Paragraphs
  htmlBody = htmlBody.split('\n\n').map(p => {
    p = p.trim();
    if (!p) return '';
    if (p.startsWith('<h') || p.startsWith('<div') || p.startsWith('<table') || p.startsWith('<pre') || p.startsWith('<ul') || p.startsWith('<blockquote') || p.startsWith('<hr')) {
      return p;
    }
    return `<p class="body-text">${p.replace(/\n/g, '<br/>')}</p>`;
  }).join('\n');

  // Construct complete HTML document with executive print styling
  const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Binary Froster Client Onboarding Handbook</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

    @page {
      size: A4;
      margin: 16mm 14mm 16mm 14mm;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0F172A;
      background-color: #FFFFFF;
      line-height: 1.6;
      font-size: 11pt;
      margin: 0;
      padding: 0;
    }

    /* Cover Page */
    .cover-page {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: always;
      background: linear-gradient(135deg, #0A0D14 0%, #0F172A 100%);
      color: #FFFFFF;
      padding: 60px 48px;
      border-radius: 12px;
      position: relative;
      overflow: hidden;
    }

    .cover-page::after {
      content: '';
      position: absolute;
      top: -100px;
      right: -100px;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, rgba(0, 0, 0, 0) 70%);
      border-radius: 50%;
    }

    .cover-brand {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .brand-logo-badge {
      width: 52px;
      height: 52px;
      background: linear-gradient(135deg, #00D4FF 0%, #10B981 100%);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 800;
      font-size: 20pt;
      color: #0A0D14;
      box-shadow: 0 10px 25px rgba(0, 212, 255, 0.3);
    }

    .brand-title {
      font-family: 'JetBrains Mono', monospace;
      font-size: 18pt;
      font-weight: 800;
      letter-spacing: 2px;
      color: #FFFFFF;
    }

    .brand-title span {
      color: #00D4FF;
    }

    .brand-subtitle {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8pt;
      color: #94A3B8;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-top: 2px;
    }

    .cover-center {
      margin: auto 0;
    }

    .cover-tag {
      display: inline-block;
      padding: 6px 14px;
      background: rgba(0, 212, 255, 0.12);
      border: 1px solid rgba(0, 212, 255, 0.35);
      border-radius: 20px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 9pt;
      color: #00D4FF;
      font-weight: 600;
      letter-spacing: 1px;
      margin-bottom: 24px;
    }

    .cover-h1 {
      font-size: 34pt;
      font-weight: 800;
      line-height: 1.15;
      margin: 0 0 20px 0;
      letter-spacing: -0.5px;
      color: #FFFFFF;
    }

    .cover-h1 span {
      background: linear-gradient(to right, #00D4FF, #34D399);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .cover-desc {
      font-size: 13pt;
      color: #94A3B8;
      max-width: 540px;
      line-height: 1.6;
      margin: 0;
    }

    .cover-footer {
      border-top: 1px solid rgba(148, 163, 184, 0.2);
      padding-top: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-family: 'JetBrains Mono', monospace;
      font-size: 8.5pt;
      color: #64748B;
    }

    .cover-meta strong {
      color: #F8FAFC;
      display: block;
      font-size: 10pt;
      margin-bottom: 4px;
    }

    /* Headings */
    .section-h1 {
      font-size: 22pt;
      font-weight: 800;
      color: #0F172A;
      margin: 32px 0 16px 0;
      letter-spacing: -0.5px;
      border-bottom: 2px solid #E2E8F0;
      padding-bottom: 10px;
    }

    .section-h2 {
      font-size: 16pt;
      font-weight: 700;
      color: #0F172A;
      margin: 28px 0 12px 0;
      page-break-after: avoid;
      break-after: avoid;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .section-h3 {
      font-size: 13pt;
      font-weight: 700;
      color: #0284C7;
      margin: 22px 0 8px 0;
      page-break-after: avoid;
      break-after: avoid;
    }

    .body-text {
      margin: 0 0 14px 0;
      color: #334155;
      font-size: 10pt;
      line-height: 1.65;
    }

    .doc-quote {
      background: #F8FAFC;
      border-left: 4px solid #0284C7;
      margin: 16px 0;
      padding: 12px 18px;
      border-radius: 0 8px 8px 0;
      font-size: 9.5pt;
      color: #475569;
    }

    .inline-code {
      font-family: 'JetBrains Mono', monospace;
      background: #F1F5F9;
      color: #0F172A;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9pt;
      border: 1px solid #E2E8F0;
    }

    .code-block {
      background: #0A0D14;
      color: #00D4FF;
      padding: 14px 18px;
      border-radius: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 8.5pt;
      line-height: 1.5;
      overflow-x: auto;
      margin: 16px 0;
      border: 1px solid #1E293B;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .section-divider {
      border: 0;
      height: 1px;
      background: #E2E8F0;
      margin: 28px 0;
    }

    /* Lists */
    .doc-list {
      margin: 0 0 16px 20px;
      padding: 0;
    }

    .list-item {
      margin-bottom: 6px;
      color: #334155;
      font-size: 9.5pt;
    }

    /* Tables */
    .table-container {
      margin: 16px 0 24px 0;
      overflow-x: auto;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9pt;
      text-align: left;
    }

    .data-table th {
      background: #0F172A;
      color: #FFFFFF;
      padding: 10px 14px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
      font-size: 8.5pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border: 1px solid #0F172A;
    }

    .data-table td {
      padding: 10px 14px;
      border: 1px solid #E2E8F0;
      color: #334155;
      vertical-align: top;
    }

    .data-table tbody tr:nth-child(even) {
      background: #F8FAFC;
    }

    /* Images */
    .image-card {
      margin: 20px 0 28px 0;
      background: #0A0D14;
      border: 1px solid #1E293B;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .image-header {
      background: #0F172A;
      padding: 8px 14px;
      display: flex;
      align-items: center;
      gap: 6px;
      border-bottom: 1px solid #1E293B;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }
    .dot.red { background: #EF4444; }
    .dot.yellow { background: #F59E0B; }
    .dot.green { background: #10B981; }

    .image-title {
      font-family: 'JetBrains Mono', monospace;
      font-size: 7.5pt;
      color: #94A3B8;
      font-weight: 600;
      letter-spacing: 0.5px;
      margin-left: 6px;
    }

    .image-card img {
      width: 100%;
      height: auto;
      display: block;
    }

    .image-caption {
      padding: 8px 14px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 8pt;
      color: #64748B;
      background: #0F172A;
      border-top: 1px solid #1E293B;
      text-align: right;
    }

    /* Section Page Breaks */
    .page-section {
      page-break-inside: avoid;
      break-inside: avoid;
      margin-bottom: 24px;
    }

    .page-break {
      page-break-before: always;
      break-before: always;
    }
  </style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="cover-page">
    <div class="cover-brand">
      <div class="brand-logo-badge">BF</div>
      <div>
        <div class="brand-title">BINARY <span>FROSTER</span></div>
        <div class="brand-subtitle">// CLIENT COMMAND PORTAL V1.0</div>
      </div>
    </div>

    <div class="cover-center">
      <span class="cover-tag">OFFICIAL ONBOARDING SPECIFICATION</span>
      <h1 class="cover-h1">Client Platform<br><span>Onboarding Handbook</span></h1>
      <p class="cover-desc">
        A comprehensive functional guide and reference manual for clients, sponsors, and engineering stakeholders navigating the Binary Froster portal.
      </p>
    </div>

    <div class="cover-footer">
      <div class="cover-meta">
        <strong>Binary Froster Software Studio</strong>
        Founding Partners: Shivam Dube • Digvijay Kadam • Jawad Khan Hakim
      </div>
      <div>
        Classification: Confidential Client Material<br>
        Published: September 2026 • Edition 1.0
      </div>
    </div>
  </div>

  <!-- MAIN CONTENT -->
  <div class="content-wrapper">
    ${htmlBody}
  </div>

</body>
</html>
  `;

  const tempHtmlPath = path.join(__dirname, 'temp_onboarding.html');
  fs.writeFileSync(tempHtmlPath, fullHtml);

  console.log('🌐 Launching headless browser for PDF export...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.setContent(fullHtml, { waitUntil: 'networkidle' });

  console.log('🖨️ Generating PDF with print styles and page formatting...');
  await page.pdf({
    path: outputPdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '16mm',
      bottom: '16mm',
      left: '12mm',
      right: '12mm'
    },
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 7pt; width: 100%; display: flex; justify-content: space-between; padding: 0 14mm; color: #94A3B8;">
        <span>BINARY FROSTER // CLIENT PLATFORM ONBOARDING HANDBOOK</span>
        <span>STRICTLY CONFIDENTIAL</span>
      </div>
    `,
    footerTemplate: `
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 7pt; width: 100%; display: flex; justify-content: space-between; padding: 0 14mm; color: #94A3B8;">
        <span>https://portal.binaryfroster.com</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>
    `
  });

  await browser.close();

  // Clean up temp HTML
  if (fs.existsSync(tempHtmlPath)) {
    fs.unlinkSync(tempHtmlPath);
  }

  // Copy to artifacts dir
  fs.copyFileSync(outputPdfPath, outputArtifactPdfPath);

  const stats = fs.statSync(outputPdfPath);
  console.log(`✅ PDF Generated Successfully!`);
  console.log(`📄 File Path: ${outputPdfPath}`);
  console.log(`📊 File Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📁 Artifact Path: ${outputArtifactPdfPath}`);
}

generatePdf().catch(err => {
  console.error('❌ PDF Generation Failed:', err);
  process.exit(1);
});
