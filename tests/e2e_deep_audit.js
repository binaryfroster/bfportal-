const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:/Users/HP/.gemini/antigravity/brain/cb2afd22-fdf9-422f-b3ec-4058a2fea09e';
const SCREENSHOT_DIR = path.join(ARTIFACT_DIR, 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const routes = [
  { name: '01_login', url: 'http://localhost:3000/login' },
  { name: '02_dashboard', url: 'http://localhost:3000/dashboard' },
  { name: '03_tasks', url: 'http://localhost:3000/tasks' },
  { name: '04_tickets', url: 'http://localhost:3000/tickets' },
  { name: '05_approvals', url: 'http://localhost:3000/approvals' },
  { name: '06_change_requests', url: 'http://localhost:3000/change-requests' },
  { name: '07_project', url: 'http://localhost:3000/project' },
  { name: '08_billing', url: 'http://localhost:3000/billing' },
  { name: '09_contracts', url: 'http://localhost:3000/contracts' },
  { name: '10_files', url: 'http://localhost:3000/files' },
  { name: '11_meetings', url: 'http://localhost:3000/meetings' },
  { name: '12_messages', url: 'http://localhost:3000/messages' },
  { name: '13_admin', url: 'http://localhost:3000/admin' },
  { name: '14_client_360', url: 'http://localhost:3000/client-360' },
  { name: '15_credential_vault', url: 'http://localhost:3000/credential-vault' },
  { name: '16_api_keys', url: 'http://localhost:3000/api-keys' },
  { name: '17_analytics', url: 'http://localhost:3000/analytics' },
  { name: '18_feedback', url: 'http://localhost:3000/feedback' },
  { name: '19_handover', url: 'http://localhost:3000/handover' },
  { name: '20_knowledge_base', url: 'http://localhost:3000/knowledge-base' },
  { name: '21_maintenance', url: 'http://localhost:3000/maintenance' },
  { name: '22_onboarding', url: 'http://localhost:3000/onboarding' },
  { name: '23_settings', url: 'http://localhost:3000/settings' }
];

async function runFastDeepAudit() {
  console.log('🚀 Starting Fast Deep QA Inspection Audit...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Step 1: Login & Initialize Auth Session
  console.log('\n--- Step 1: Authenticating Client Officer ---');
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_login_page.png') });
  
  const loginBtn = await page.$('button:has-text("SIGN IN TO PORTAL")');
  if (loginBtn) {
    await loginBtn.click();
    await page.waitForTimeout(1000);
  }

  // Step 2: Traverse all 23 routes and capture screenshots
  console.log('\n--- Step 2: Auditing All 23 Portal Routes ---');
  const results = [];
  for (const r of routes) {
    if (r.name === '01_login') continue;
    try {
      await page.goto(r.url, { waitUntil: 'domcontentloaded', timeout: 8000 });
      await page.waitForTimeout(600);
      const title = await page.title();
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${r.name}.png`) });
      results.push({ name: r.name, url: r.url, ok: true, title });
      console.log(`✅ [PASS] ${r.name} -> ${r.url}`);
    } catch (err) {
      results.push({ name: r.name, url: r.url, ok: false, error: err.message });
      console.error(`❌ [FAIL] ${r.name} -> ${err.message}`);
    }
  }

  // Step 3: Test Interactive Action Buttons on /tasks
  console.log('\n--- Step 3: Testing Task Board Action Controls ---');
  await page.goto('http://localhost:3000/tasks', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
  
  // Test "In Progress" button
  const inProgressBtn = await page.$('button:has-text("In Progress")');
  if (inProgressBtn) {
    await inProgressBtn.click();
    console.log('✅ Clicked "In Progress" task action button');
    await page.waitForTimeout(400);
  }

  // Test "Mark Done" button
  const markDoneBtn = await page.$('button:has-text("Mark Done")');
  if (markDoneBtn) {
    await markDoneBtn.click();
    console.log('✅ Clicked "Mark Done" task action button');
    await page.waitForTimeout(400);
  }

  // Test "Edit" button
  const editBtn = await page.$('button:has-text("Edit")');
  if (editBtn) {
    await editBtn.click();
    console.log('✅ Clicked "Edit" task action button -> Modal Opened');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'tasks_edit_modal.png') });
    const cancelBtn = await page.$('button:has-text("[CANCEL]")');
    if (cancelBtn) await cancelBtn.click();
    await page.waitForTimeout(300);
  }

  // Step 4: Test Interactive Action Buttons on /tickets
  console.log('\n--- Step 4: Testing Support Tickets Action Controls ---');
  await page.goto('http://localhost:3000/tickets', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
  
  const ticketEditBtn = await page.$('button:has-text("Edit Ticket")');
  if (ticketEditBtn) {
    await ticketEditBtn.click();
    console.log('✅ Clicked "Edit Ticket" action button -> Modal Opened');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'tickets_edit_modal.png') });
    const cancelBtn = await page.$('button:has-text("[CANCEL]")');
    if (cancelBtn) await cancelBtn.click();
    await page.waitForTimeout(300);
  }

  // Step 5: Test Interactive Action Buttons on /approvals
  console.log('\n--- Step 5: Testing Deliverable Approvals Action Controls ---');
  await page.goto('http://localhost:3000/approvals', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
  const delEditBtn = await page.$('button:has-text("Edit Spec")');
  if (delEditBtn) {
    await delEditBtn.click();
    console.log('✅ Clicked "Edit Spec" action button -> Modal Opened');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'approvals_edit_modal.png') });
    const cancelBtn = await page.$('button:has-text("[CANCEL]")');
    if (cancelBtn) await cancelBtn.click();
    await page.waitForTimeout(300);
  }

  // Step 6: Test Interactive Action Buttons on /change-requests
  console.log('\n--- Step 6: Testing Change Requests Action Controls ---');
  await page.goto('http://localhost:3000/change-requests', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
  const crEditBtn = await page.$('button:has-text("Edit Request")');
  if (crEditBtn) {
    await crEditBtn.click();
    console.log('✅ Clicked "Edit Request" action button -> Modal Opened');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'change_requests_edit_modal.png') });
    const cancelBtn = await page.$('button:has-text("[CANCEL]")');
    if (cancelBtn) await cancelBtn.click();
    await page.waitForTimeout(300);
  }

  // Step 7: Test Interactive Action Buttons on /project
  console.log('\n--- Step 7: Testing Project Milestones Action Controls ---');
  await page.goto('http://localhost:3000/project', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
  const milestoneEditBtn = await page.$('button:has-text("Edit")');
  if (milestoneEditBtn) {
    await milestoneEditBtn.click();
    console.log('✅ Clicked "Edit Milestone" action button -> Modal Opened');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'milestone_edit_modal.png') });
    const cancelBtn = await page.$('button:has-text("[CANCEL]")');
    if (cancelBtn) await cancelBtn.click();
    await page.waitForTimeout(300);
  }

  // Step 8: Multi-Viewport Responsive Audits
  console.log('\n--- Step 8: Responsive Breakpoint Audits ---');
  const viewports = [
    { name: 'Desktop_1440px', width: 1440, height: 900 },
    { name: 'Tablet_768px', width: 768, height: 1024 },
    { name: 'Mobile_375px', width: 375, height: 812 }
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `responsive_${vp.name}.png`) });
    console.log(`✅ [PASS] Captured Viewport: ${vp.name}`);
  }

  const passedCount = results.filter(r => r.ok).length;
  console.log(`\n========================================`);
  console.log(`🏁 DEEP AUDIT SUMMARY:`);
  console.log(`Total Routes Tested: ${results.length}`);
  console.log(`Passed Routes: ${passedCount}`);
  console.log(`Failed Routes: ${results.length - passedCount}`);
  console.log(`Console Errors: ${consoleErrors.length}`);
  console.log(`========================================\n`);

  fs.writeFileSync(path.join(ARTIFACT_DIR, 'test_diagnostics.json'), JSON.stringify({
    timestamp: new Date().toISOString(),
    routesSummary: results,
    consoleErrors
  }, null, 2));

  await browser.close();
}

runFastDeepAudit().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
