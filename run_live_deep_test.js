const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = "C:/Users/HP/.gemini/antigravity/brain/cb2afd22-fdf9-422f-b3ec-4058a2fea09e";
const SCREENSHOT_DIR = path.join(ARTIFACT_DIR, "screenshots");
const RECORDING_DIR = path.join(ARTIFACT_DIR, "video_raw");

if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
if (!fs.existsSync(RECORDING_DIR)) fs.mkdirSync(RECORDING_DIR, { recursive: true });

const consoleLogs = [];
const networkErrors = [];
const pageErrors = [];
const auditResults = [];

(async () => {
  console.log("🚀 Starting Deep Browser Testing & Live .webm Video Recording...");

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: RECORDING_DIR,
      size: { width: 1280, height: 720 }
    }
  });

  const page = await context.newPage();

  // Diagnostics Listeners
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    if (type === 'error' || type === 'warning' || text.includes('Error')) {
      consoleLogs.push({ type, text, location: page.url() });
    }
  });

  page.on('pageerror', err => {
    pageErrors.push({ message: err.message, stack: err.stack, url: page.url() });
  });

  page.on('response', response => {
    if (response.status() >= 400) {
      networkErrors.push({ url: response.url(), status: response.status(), statusText: response.statusText() });
    }
  });

  // Pages to test
  const routes = [
    { path: '/login', name: 'Login' },
    { path: '/register', name: 'Register' },
    { path: '/forgot-password', name: 'Forgot Password' },
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/project', name: 'Project Workspace' },
    { path: '/tasks', name: 'Task Board' },
    { path: '/approvals', name: 'Deliverable Approvals' },
    { path: '/billing', name: 'Billing & Invoices' },
    { path: '/contracts', name: 'Contracts & E-Sign' },
    { path: '/files', name: 'File Vault' },
    { path: '/meetings', name: 'Meetings & Bookings' },
    { path: '/messages', name: 'Live Chat & Messages' },
    { path: '/tickets', name: 'Support Tickets' },
    { path: '/admin', name: 'Admin Control Center' },
    { path: '/client-360', name: 'Client 360 CRM' },
    { path: '/credential-vault', name: 'Credential Vault' },
    { path: '/api-keys', name: 'API Keys' },
    { path: '/analytics', name: 'Analytics & Reports' },
    { path: '/change-requests', name: 'Change Requests' },
    { path: '/feedback', name: 'Client Feedback' },
    { path: '/handover', name: 'Project Handover' },
    { path: '/integrations', name: 'App Integrations' },
    { path: '/knowledge-base', name: 'Knowledge Base' },
    { path: '/maintenance', name: 'SLA Maintenance' },
    { path: '/onboarding', name: 'Client Onboarding' },
    { path: '/settings', name: 'User Settings' }
  ];

  console.log("🔑 Step 1: Testing Login Flow...");
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_login_page.png') });

  try {
    const emailInput = await page.$('input[type="email"], input[name="email"]');
    const passInput = await page.$('input[type="password"], input[name="password"]');
    if (emailInput && passInput) {
      await emailInput.fill('shivam@binaryfroster.com');
      await passInput.fill('password123');
      const submitBtn = await page.$('button[type="submit"], button:has-text("Sign in"), button:has-text("Log in")');
      if (submitBtn) {
        await submitBtn.click();
        await page.waitForTimeout(1500);
      }
    }
  } catch (e) {
    console.log("Login note:", e.message);
  }

  console.log("🌐 Step 2: Systematically Navigating All 27 Portal Pages...");
  for (let i = 0; i < routes.length; i++) {
    const r = routes[i];
    const targetUrl = `http://localhost:3000${r.path}`;
    console.log(` Testing [${i + 1}/${routes.length}]: ${r.name} (${r.path})`);

    const pageStartTime = Date.now();
    try {
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 5000 });
    } catch (e) {
      console.log(`  Timeout/Note loading ${r.path}:`, e.message);
    }
    const loadTimeMs = Date.now() - pageStartTime;
    await page.waitForTimeout(400);

    const safeName = r.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const screenshotPath = path.join(SCREENSHOT_DIR, `page_${i + 1}_${safeName}.png`);
    try {
      await page.screenshot({ path: screenshotPath, fullPage: false, timeout: 3000 });
    } catch (e) {
      console.log(`  Screenshot note for ${r.path}:`, e.message);
    }

    let buttonsCount = 0;
    let inputsCount = 0;
    let interactionPerformed = "None";

    try {
      const buttons = await page.$$('button');
      const inputs = await page.$$('input, textarea, select');
      buttonsCount = buttons.length;
      inputsCount = inputs.length;

      if (buttons.length > 0) {
        const btnText = await buttons[0].innerText().catch(() => "");
        if (btnText && !btnText.toLowerCase().includes('delete') && !btnText.toLowerCase().includes('logout')) {
          await buttons[0].click({ timeout: 1000 }).catch(() => {});
          await page.waitForTimeout(200);
          interactionPerformed = `Clicked button: "${btnText.trim().substring(0, 20)}"`;
        }
      }
    } catch (err) {}

    auditResults.push({
      route: r.path,
      name: r.name,
      loadTimeMs,
      buttonsCount,
      inputsCount,
      interaction: interactionPerformed,
      screenshot: screenshotPath
    });
  }

  console.log("📱 Step 3: Testing Responsive Viewports...");
  const viewports = [
    { name: 'Mobile_375px', width: 375, height: 667 },
    { name: 'Tablet_768px', width: 768, height: 1024 },
    { name: 'Desktop_1440px', width: 1440, height: 900 }
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `responsive_${vp.name}.png`) });
  }

  console.log("🎬 Finalizing Live Recording & Closing Browser...");
  await page.close();
  await context.close();
  await browser.close();

  const videoFiles = fs.readdirSync(RECORDING_DIR).filter(f => f.endsWith('.webm'));
  if (videoFiles.length > 0) {
    const rawVideoPath = path.join(RECORDING_DIR, videoFiles[0]);
    const finalVideoPath = path.join(ARTIFACT_DIR, "live_testing_recording.webm");
    fs.copyFileSync(rawVideoPath, finalVideoPath);
    console.log(`✅ Live testing .webm video successfully saved to: ${finalVideoPath}`);
  }

  const diagnosticSummary = {
    testedAt: new Date().toISOString(),
    routesTested: auditResults.length,
    auditResults,
    consoleLogs,
    pageErrors,
    networkErrors
  };

  fs.writeFileSync(path.join(ARTIFACT_DIR, "test_diagnostics.json"), JSON.stringify(diagnosticSummary, null, 2));
  console.log("🎉 Deep Live Browser Testing Run Complete!");
})();
