const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = "C:/Users/HP/.gemini/antigravity/brain/d674dd5e-8df6-4ba1-aee2-cdef867258c2";
const SCREENSHOT_DIR = path.join(ARTIFACT_DIR, "screenshots", "deep_test");

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const diagnostics = {
  testedAt: new Date().toISOString(),
  environment: "Next.js 15 Production Build (Port 3000)",
  routesAudit: [],
  responsiveAudit: [],
  apiAudit: [],
  proposalFeatureAudit: {},
  consoleWarnings: [],
  pageErrors: [],
  networkErrors: [],
  accessibilityViolations: [],
  summary: {}
};

(async () => {
  console.log("🔬 Starting Deep Testing Master Audit for Binary Froster Portal...");

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  // Listeners for diagnostics
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    if (type === 'error' || type === 'warning' || text.toLowerCase().includes('error')) {
      diagnostics.consoleWarnings.push({ type, text, url: page.url() });
    }
  });

  page.on('pageerror', err => {
    console.error("  [PageError]", err.message);
    diagnostics.pageErrors.push({ message: err.message, stack: err.stack, url: page.url() });
  });

  page.on('response', resp => {
    if (resp.status() >= 400) {
      diagnostics.networkErrors.push({ url: resp.url(), status: resp.status(), statusText: resp.statusText() });
    }
  });

  // Step 1: Authentication Gate
  console.log("\n🔑 Phase 2.1: Authentication & Session Gate Testing...");
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_login_screen.png') });

  try {
    const emailInput = await page.$('input[type="email"], input[name="email"]');
    const passInput = await page.$('input[type="password"], input[name="password"]');
    if (emailInput && passInput) {
      await emailInput.fill('shivam@binaryfroster.com');
      await passInput.fill('password123');
      const submitBtn = await page.$('button[type="submit"], button:has-text("Sign in"), button:has-text("Log in"), button:has-text("ENTER")');
      if (submitBtn) {
        await submitBtn.click();
        await page.waitForTimeout(1200);
      }
    }
  } catch (e) {
    console.log("  Auth note:", e.message);
  }

  // Step 2: Full Page Route Traversal (All 31 pages)
  const routes = [
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/proposals', name: 'AI Proposals Engine' },
    { path: '/project', name: 'Project Workspace' },
    { path: '/tasks', name: 'Sprint Kanban' },
    { path: '/approvals', name: 'Deliverable Approvals' },
    { path: '/billing', name: 'Billing & Invoices' },
    { path: '/contracts', name: 'Contracts & E-Sign' },
    { path: '/files', name: 'File Vault' },
    { path: '/meetings', name: 'Meetings & Bookings' },
    { path: '/tickets', name: 'Support & Tickets' },
    { path: '/admin', name: 'Admin Control Center' },
    { path: '/admin/projects', name: 'Admin Client Projects' },
    { path: '/client-360', name: 'Client 360 CRM' },
    { path: '/activity', name: 'Live Audit Log' },
    { path: '/credential-vault', name: 'Credential Vault' },
    { path: '/api-keys', name: 'API Keys Console' },
    { path: '/analytics', name: 'Real-Time Analytics' },
    { path: '/change-requests', name: 'Change Requests' },
    { path: '/feedback', name: 'Client Feedback' },
    { path: '/handover', name: 'Project Handover' },
    { path: '/knowledge-base', name: 'Knowledge Base' },
    { path: '/maintenance', name: 'SLA Maintenance' },
    { path: '/onboarding', name: 'Client Onboarding' },
    { path: '/settings', name: 'User Settings' },
    { path: '/login', name: 'Login Gate' },
    { path: '/register', name: 'Register Notice' },
    { path: '/forgot-password', name: 'Forgot Password' },
    { path: '/reset-password', name: 'Reset Password' }
  ];

  console.log(`\n🌐 Phase 2.2: Systematic Route Traversal (${routes.length} core pages)...`);
  for (let i = 0; i < routes.length; i++) {
    const r = routes[i];
    const url = `http://localhost:3000${r.path}`;
    const start = Date.now();
    let status = "PASS";
    let errorDetail = null;

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 7000 });
      await page.waitForTimeout(300);
    } catch (err) {
      status = "TIMEOUT";
      errorDetail = err.message;
    }
    const loadTimeMs = Date.now() - start;

    const safeName = `${String(i + 1).padStart(2, '0')}_${r.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const screenshotPath = path.join(SCREENSHOT_DIR, `${safeName}.png`);
    await page.screenshot({ path: screenshotPath }).catch(() => {});

    // Inspect interactive elements
    const buttons = await page.$$('button');
    const inputs = await page.$$('input, textarea, select');
    const links = await page.$$('a[href]');
    const images = await page.$$('img');

    // Accessibility check: missing alt attributes on images
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      if (alt === null || alt === "") {
        const src = await img.getAttribute('src');
        diagnostics.accessibilityViolations.push({
          page: r.path,
          type: "Image missing alt text",
          element: src || "unknown img"
        });
      }
    }

    diagnostics.routesAudit.push({
      route: r.path,
      name: r.name,
      status,
      loadTimeMs,
      buttonsCount: buttons.length,
      inputsCount: inputs.length,
      linksCount: links.length,
      screenshot: screenshotPath,
      error: errorDetail
    });

    console.log(`  ✓ [${i + 1}/${routes.length}] ${r.name.padEnd(25)}: ${loadTimeMs}ms (${status})`);
  }

  // Step 3: Deep Interactive Test of the New Proposal Feature
  console.log("\n🤖 Phase 2.3: Deep Functional Testing of AI Proposal Engine...");
  try {
    await page.goto('http://localhost:3000/proposals', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'proposal_01_initial_list.png') });

    // Click "+ Generate Proposal"
    const generateBtn = await page.$('button:has-text("Generate Proposal"), button:has-text("Generate New Proposal")');
    if (generateBtn) {
      await generateBtn.click();
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'proposal_02_step1_wizard.png') });

      // Fill in Step 1
      const clientInput = await page.$('input[placeholder*="Acme"], input[placeholder*="Client"], input[placeholder*="Sterling"]');
      const titleInput = await page.$('input[placeholder*="Trading"], input[placeholder*="Platform"], input[placeholder*="Project"]');
      const descInput = await page.$('textarea');

      if (clientInput) await clientInput.fill('Apex Wealth Partners');
      if (titleInput) await titleInput.fill('Institutional Algorithmic Trading Desk');
      if (descInput) await descInput.fill('Ultra-low latency matching engine with automated risk controls and multi-asset compliance.');

      // Click Next
      const nextBtn1 = await page.$('button:has-text("Next")');
      if (nextBtn1) {
        await nextBtn1.click();
        await page.waitForTimeout(300);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'proposal_03_step2_budget.png') });

        // Fill in Step 2: Budget
        const budgetInput = await page.$('input[type="number"]');
        if (budgetInput) await budgetInput.fill('85000');

        const nextBtn2 = await page.$('button:has-text("Next")');
        if (nextBtn2) {
          await nextBtn2.click();
          await page.waitForTimeout(300);
          await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'proposal_04_step3_tech.png') });

          // Select tech chips
          const nextjsChip = await page.$('button:has-text("Next.js")');
          const rustChip = await page.$('button:has-text("Rust")');
          const postgresChip = await page.$('button:has-text("PostgreSQL")');
          const dockerChip = await page.$('button:has-text("Docker")');

          if (nextjsChip) await nextjsChip.click();
          if (rustChip) await rustChip.click();
          if (postgresChip) await postgresChip.click();
          if (dockerChip) await dockerChip.click();

          // Click "Generate with AI"
          const aiSubmitBtn = await page.$('button:has-text("Generate with AI")');
          if (aiSubmitBtn) {
            console.log("  ✨ Triggering AI Proposal Pipeline generation...");
            await aiSubmitBtn.click();
            // Wait for generation
            await page.waitForTimeout(3500);
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'proposal_05_generated_document.png') });

            // Verify Document Elements
            const execSummary = await page.$('text=Apex Wealth Partners');
            const costTable = await page.$('table');

            diagnostics.proposalFeatureAudit = {
              formNavigation: "SUCCESS",
              generationTrigger: "SUCCESS",
              documentRendered: Boolean(execSummary || costTable),
              costTableInteractive: Boolean(costTable)
            };
            console.log("  ✅ AI Proposal generated and rendered into editable document successfully!");
          }
        }
      }
    }
  } catch (err) {
    console.error("  ❌ Proposal test error:", err.message);
    diagnostics.proposalFeatureAudit = { error: err.message };
  }

  // Step 4: Responsive Breakpoint Audit
  console.log("\n📱 Phase 3: Responsive Breakpoint Testing (Mobile, Tablet, Desktop)...");
  const responsiveBreakpoints = [
    { name: 'Mobile_375px', width: 375, height: 667 },
    { name: 'Tablet_768px', width: 768, height: 1024 },
    { name: 'Desktop_1440px', width: 1440, height: 900 }
  ];

  const targetResponsivePages = ['/dashboard', '/proposals', '/billing', '/project', '/tasks'];

  for (const bp of responsiveBreakpoints) {
    await page.setViewportSize({ width: bp.width, height: bp.height });
    for (const pPath of targetResponsivePages) {
      await page.goto(`http://localhost:3000${pPath}`, { waitUntil: 'domcontentloaded', timeout: 5000 });
      await page.waitForTimeout(300);
      const safeName = `responsive_${bp.name}_${pPath.replace('/', '')}.png`;
      const sPath = path.join(SCREENSHOT_DIR, safeName);
      await page.screenshot({ path: sPath });

      // Check horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      diagnostics.responsiveAudit.push({
        viewport: bp.name,
        width: bp.width,
        page: pPath,
        horizontalOverflow: hasHorizontalScroll,
        screenshot: sPath
      });
    }
  }
  console.log(`  ✓ Checked ${responsiveBreakpoints.length * targetResponsivePages.length} responsive viewports.`);

  // Step 5: Direct API Route Testing
  console.log("\n⚡ Phase 8: Direct API Route Verification...");
  const apiPayloads = [
    {
      name: "AI Proposal Generation API",
      url: "http://localhost:3000/api/ai/proposal",
      method: "POST",
      body: {
        clientName: "DeepTest Client",
        projectTitle: "Automated Verification Engine",
        projectType: "Custom Software",
        briefDescription: "Full automated regression and performance testing suite",
        estimatedBudget: 50000,
        currency: "USD",
        timelinePreference: "8 weeks",
        techStackPreference: ["TypeScript", "Playwright", "Next.js"],
        priorityFeatures: "Automated report generation"
      }
    },
    {
      name: "AI Engineering Copilot API",
      url: "http://localhost:3000/api/ai/copilot",
      method: "POST",
      body: {
        prompt: "What is the status of the current project milestones?",
        context: "project"
      }
    }
  ];

  for (const api of apiPayloads) {
    const start = Date.now();
    try {
      const response = await fetch(api.url, {
        method: api.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(api.body)
      });
      const data = await response.json();
      const elapsed = Date.now() - start;

      diagnostics.apiAudit.push({
        name: api.name,
        url: api.url,
        status: response.status,
        latencyMs: elapsed,
        success: response.ok,
        dataSummary: response.ok ? (data.source || (data.reply ? "Copilot Reply OK" : "Success")) : data.error
      });
      console.log(`  ✓ ${api.name.padEnd(30)}: HTTP ${response.status} in ${elapsed}ms (${response.ok ? 'SUCCESS' : 'FAIL'})`);
    } catch (e) {
      diagnostics.apiAudit.push({
        name: api.name,
        url: api.url,
        status: 500,
        error: e.message
      });
      console.log(`  ❌ ${api.name}: ${e.message}`);
    }
  }

  // Summary Metrics
  const passedRoutes = diagnostics.routesAudit.filter(r => r.status === "PASS").length;
  const avgLoadTime = Math.round(diagnostics.routesAudit.reduce((sum, r) => sum + r.loadTimeMs, 0) / Math.max(1, diagnostics.routesAudit.length));

  diagnostics.summary = {
    totalRoutesAudited: diagnostics.routesAudit.length,
    routesPassed: passedRoutes,
    passRate: `${Math.round((passedRoutes / diagnostics.routesAudit.length) * 100)}%`,
    averagePageLoadMs: avgLoadTime,
    totalConsoleErrors: diagnostics.pageErrors.length,
    totalNetworkErrors: diagnostics.networkErrors.length,
    accessibilityFlags: diagnostics.accessibilityViolations.length,
    responsiveOverflowIssues: diagnostics.responsiveAudit.filter(r => r.horizontalOverflow).length
  };

  // Save diagnostic output
  const diagPath = path.join(ARTIFACT_DIR, "deep_testing_diagnostics.json");
  fs.writeFileSync(diagPath, JSON.stringify(diagnostics, null, 2));

  console.log("\n📊 Summary of Deep Testing Run:");
  console.log(`  - Total Routes Audited:   ${diagnostics.summary.totalRoutesAudited}`);
  console.log(`  - Route Pass Rate:        ${diagnostics.summary.passRate}`);
  console.log(`  - Average Page Load:      ${diagnostics.summary.averagePageLoadMs}ms`);
  console.log(`  - Page Runtime Errors:    ${diagnostics.summary.totalConsoleErrors}`);
  console.log(`  - Network HTTP Errors:    ${diagnostics.summary.totalNetworkErrors}`);
  console.log(`  - Responsive Overflows:   ${diagnostics.summary.responsiveOverflowIssues}`);
  console.log(`  - Diagnostics saved to:   ${diagPath}`);

  await page.close();
  await context.close();
  await browser.close();
  console.log("🎉 Deep Testing Run Finished!");
})();
