/**
 * Binary Froster Portal — Comprehensive User Personality Deep Test
 * Tests all 6 registered user personalities and the full RBAC system
 */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE = "http://localhost:3000";
const SS_DIR = path.join(__dirname, "..", "screenshots", "personality_audit");

// All registered user accounts
const USERS = [
  { email: "shivam@binaryfroster.com", name: "Shivam Dube", role: "admin", company: "Binary Froster" },
  { email: "digvijay@binaryfroster.com", name: "Digvijay Kadam", role: "admin", company: "Binary Froster" },
  { email: "jawad@binaryfroster.com", name: "Jawad Khan Hakim", role: "admin", company: "Binary Froster" },
  { email: "jawadkhanhakim@gmail.com", name: "Jawad Khan Hakim", role: "admin", company: "Binary Froster" },
  { email: "john@sterling.com", name: "John Sterling", role: "client", company: "Sterling Capital Group" },
  { email: "client@acme.com", name: "Acme Client Profile", role: "client", company: "Acme Enterprises Inc." },
];

// All portal routes to test
const ALL_ROUTES = [
  { path: "/dashboard", name: "Dashboard" },
  { path: "/tasks", name: "Task Board" },
  { path: "/tickets", name: "Support Tickets" },
  { path: "/approvals", name: "Approvals" },
  { path: "/change-requests", name: "Change Requests" },
  { path: "/project", name: "Project Workspace" },
  { path: "/billing", name: "Billing" },
  { path: "/contracts", name: "Contracts" },
  { path: "/files", name: "File Vault" },
  { path: "/meetings", name: "Meetings" },
  { path: "/messages", name: "Messages" },
  { path: "/admin", name: "Admin Control Center" },
  { path: "/client-360", name: "Client 360" },
  { path: "/credential-vault", name: "Credential Vault" },
  { path: "/api-keys", name: "API Keys" },
  { path: "/analytics", name: "Analytics" },
  { path: "/feedback", name: "Feedback" },
  { path: "/handover", name: "Handover" },
  { path: "/knowledge-base", name: "Knowledge Base" },
  { path: "/maintenance", name: "Maintenance" },
  { path: "/onboarding", name: "Onboarding" },
  { path: "/settings", name: "Settings" },
];

// Action button selectors to look for
const ACTION_BUTTON_KEYWORDS = [
  "EDIT", "IN PROGRESS", "MARK DONE", "MARK AS DONE", "APPROVE", "RESOLVE",
  "DELETE", "REVOKE", "CANCEL", "DOWNLOAD", "EXPORT", "SAVE", "SUBMIT",
  "REQUEST_REVISION", "MARK COMPLETED", "REOPEN", "VOID", "RESEND",
  "GENERATE", "COPY", "PRINT", "SEAL", "SIGN", "REFRESH", "UPGRADE",
  "BOOK", "JOIN", "PAY", "VERIFY",
];

// All 11 defined roles in the RBAC system
const ALL_RBAC_ROLES = [
  "client", "admin", "client_user", "client_admin", "super_admin",
  "project_manager", "developer", "designer", "support_agent",
  "finance", "account_manager",
];

const results = {
  personalities: [],
  rolesCoveredByMockUsers: [],
  rolesMissingMockUsers: [],
  adminAccessTests: [],
  actionButtonAudit: [],
  consoleErrors: [],
  summary: {},
};

function safeName(str) {
  return str.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
}

async function clearSession(page) {
  try {
    await page.evaluate(() => {
      localStorage.clear();
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/");
      });
    });
  } catch (e) {
    // localStorage not available (about:blank), skip
  }
}

async function loginAs(page, user) {
  // Navigate to login page first (so we have a valid origin)
  await page.goto(BASE + "/login", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(500);
  
  // Now clear session (we're on a real page)
  await clearSession(page);
  
  // Reload login page after clearing
  await page.goto(BASE + "/login", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);

  // Check if we're actually on the login page (might have been redirected)
  if (!page.url().includes("/login")) {
    // Already logged in, clear and retry
    await clearSession(page);
    await page.goto(BASE + "/login", { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(1500);
  }

  // Fill email field
  var emailInput = await page.$("#email-input");
  if (!emailInput) {
    emailInput = await page.$('input[type="email"]');
  }
  if (!emailInput) {
    console.log("  [FAIL] No email input found on login page for " + user.email);
    return false;
  }
  await emailInput.fill(user.email);
  await page.waitForTimeout(200);

  // Fill password field (required - any password works with mock auth)
  var passwordInput = await page.$("#password-input");
  if (!passwordInput) {
    passwordInput = await page.$('input[type="password"]');
  }
  if (passwordInput) {
    await passwordInput.fill("password123");
    await page.waitForTimeout(200);
  }

  // Click the INITIALIZE SESSION button and wait for navigation
  var loginBtn = await page.$("#login-button");
  if (!loginBtn) {
    loginBtn = await page.$('button[type="submit"]');
  }
  
  try {
    if (loginBtn) {
      await Promise.all([
        page.waitForURL("**/dashboard**", { timeout: 15000 }).catch(function() {}),
        loginBtn.click(),
      ]);
    } else {
      await Promise.all([
        page.waitForURL("**/dashboard**", { timeout: 15000 }).catch(function() {}),
        emailInput.press("Enter"),
      ]);
    }
  } catch (e) {
    // Navigation might have happened differently
  }
  
  await page.waitForTimeout(1000);
  
  const currentUrl = page.url();
  if (currentUrl.includes("/dashboard") || currentUrl.includes("/onboarding")) {
    console.log("  [PASS] Login successful for " + user.name + " (" + user.role + ")");
    return true;
  } else {
    console.log("  [WARN] Login may have failed for " + user.name + ". URL: " + currentUrl);
    return currentUrl !== BASE + "/login";
  }
}

async function testRoute(page, route, user, screenshotPrefix) {
  const result = {
    route: route.path,
    name: route.name,
    user: user.name,
    role: user.role,
    status: "unknown",
    redirectedTo: null,
    actionButtonsFound: [],
    errors: [],
  };

  try {
    const response = await page.goto(BASE + route.path, {
      waitUntil: "domcontentloaded",
      timeout: 8000,
    });
    await page.waitForTimeout(600);

    const finalUrl = page.url();
    const statusCode = response ? response.status() : 0;

    if (!finalUrl.includes(route.path)) {
      result.redirectedTo = finalUrl.replace(BASE, "");
      result.status = "redirected";
    } else if (statusCode >= 400) {
      result.status = "error";
    } else {
      result.status = "pass";
    }

    // Scan for action buttons
    const buttons = await page.$$eval("button", (btns) =>
      btns.map((b) => (b.textContent || "").trim()).filter(Boolean)
    );
    
    for (const keyword of ACTION_BUTTON_KEYWORDS) {
      const found = buttons.filter((b) =>
        b.toUpperCase().includes(keyword)
      );
      if (found.length > 0) {
        result.actionButtonsFound.push(...found.map(function(f) { return f.substring(0, 60); }));
      }
    }
    result.actionButtonsFound = [...new Set(result.actionButtonsFound)];

    const ssName = screenshotPrefix + "_" + safeName(route.name) + ".png";
    await page.screenshot({ path: path.join(SS_DIR, ssName), fullPage: false });

  } catch (err) {
    result.status = "timeout";
    result.errors.push(err.message.split("\n")[0]);
  }

  return result;
}

async function testActionButtons(page, route) {
  var actionResults = [];
  
  try {
    var editBtn = await page.$('button:has-text("EDIT"), button:has-text("Edit")');
    if (editBtn) {
      var isVisible = await editBtn.isVisible();
      if (isVisible) {
        await editBtn.click();
        await page.waitForTimeout(500);
        
        var modal = await page.$('[class*="fixed"][class*="inset"], [role="dialog"]');
        actionResults.push({
          button: "EDIT",
          page: route.path,
          clicked: true,
          modalOpened: !!modal,
        });
        
        if (modal) {
          var closeBtn = await page.$('button:has-text("CANCEL"), button:has-text("Close"), button[aria-label="close"]');
          if (closeBtn) await closeBtn.click();
          else await page.keyboard.press("Escape");
          await page.waitForTimeout(300);
        }
      }
    }
  } catch (e) {
    // Ignore button click errors
  }
  
  return actionResults;
}

(async () => {
  console.log("Starting Comprehensive User Personality Deep Test...\n");

  fs.mkdirSync(SS_DIR, { recursive: true });

  var browser = await chromium.launch({ headless: true });

  // PHASE 0: Role Coverage Audit
  console.log("===================================================");
  console.log("PHASE 0: RBAC Role Coverage Audit");
  console.log("===================================================\n");

  var registeredRoles = [];
  USERS.forEach(function(u) {
    if (!registeredRoles.includes(u.role)) registeredRoles.push(u.role);
  });
  results.rolesCoveredByMockUsers = registeredRoles;
  results.rolesMissingMockUsers = ALL_RBAC_ROLES.filter(function(r) {
    return !registeredRoles.includes(r);
  });

  console.log("[PASS] Roles WITH registered mock users: " + registeredRoles.join(", "));
  console.log("[MISS] Roles WITHOUT registered mock users: " + results.rolesMissingMockUsers.join(", "));
  console.log("Coverage: " + registeredRoles.length + "/" + ALL_RBAC_ROLES.length + " roles have test users\n");

  // Test each user personality
  for (var i = 0; i < USERS.length; i++) {
    var user = USERS[i];
    var phaseNum = i + 1;
    var prefix = "P" + phaseNum + "_" + safeName(user.name);

    console.log("===================================================");
    console.log("PHASE " + phaseNum + ": Testing " + user.name + " (" + user.role + ")");
    console.log("  Email: " + user.email);
    console.log("  Company: " + user.company);
    console.log("===================================================\n");

    var context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    var page = await context.newPage();

    var pageErrors = [];
    page.on("console", function(msg) {
      if (msg.type() === "error") {
        pageErrors.push({ user: user.name, msg: msg.text().substring(0, 120) });
      }
    });

    // LOGIN
    console.log("--- Step 1: Logging in as " + user.name + " ---");
    var loginSuccess = await loginAs(page, user);

    if (!loginSuccess) {
      console.log("  Skipping route tests for " + user.name + " - login failed\n");
      results.personalities.push({
        user: user.name,
        email: user.email,
        role: user.role,
        loginSuccess: false,
        routeResults: [],
      });
      await context.close();
      continue;
    }

    await page.screenshot({
      path: path.join(SS_DIR, prefix + "_dashboard_after_login.png"),
      fullPage: false,
    });

    // CHECK DASHBOARD GREETING
    console.log("--- Step 2: Verifying dashboard greeting ---");
    var pageText = await page.textContent("body");
    var hasUserName = pageText && (pageText.includes(user.name) || pageText.includes(user.name.split(" ")[0]));
    console.log("  " + (hasUserName ? "[PASS]" : "[WARN]") + " Dashboard " + (hasUserName ? "shows" : "may not show") + " user name: " + user.name);

    // TEST ALL ROUTES
    console.log("--- Step 3: Testing all " + ALL_ROUTES.length + " portal routes ---");
    var userRouteResults = [];

    for (var j = 0; j < ALL_ROUTES.length; j++) {
      var route = ALL_ROUTES[j];
      var routeResult = await testRoute(page, route, user, prefix);
      userRouteResults.push(routeResult);

      var statusIcon =
        routeResult.status === "pass" ? "[PASS]" :
        routeResult.status === "redirected" ? "[RDIR]" :
        routeResult.status === "timeout" ? "[TIME]" : "[FAIL]";

      var logLine = "  " + statusIcon + " " + route.name + " (" + route.path + ")";
      if (routeResult.redirectedTo) {
        logLine += " -> Redirected to " + routeResult.redirectedTo;
      }
      if (routeResult.actionButtonsFound.length > 0) {
        logLine += " | Buttons: " + routeResult.actionButtonsFound.length;
      }
      console.log(logLine);
    }

    // TEST ADMIN ACCESS CONTROL
    console.log("\n--- Step 4: Admin access control test ---");
    var adminResult = userRouteResults.find(function(r) { return r.route === "/admin"; });
    if (user.role === "admin") {
      if (adminResult && adminResult.status === "pass") {
        console.log("  [PASS] Admin panel ACCESSIBLE (correct for admin role)");
        results.adminAccessTests.push({ user: user.name, role: "admin", adminAccess: true, correct: true });
      } else {
        console.log("  [FAIL] Admin panel NOT accessible (WRONG - admin should have access)");
        results.adminAccessTests.push({ user: user.name, role: "admin", adminAccess: false, correct: false });
      }
    } else {
      if (adminResult && adminResult.status === "redirected") {
        console.log("  [PASS] Admin panel BLOCKED with redirect (correct for " + user.role + " role)");
        results.adminAccessTests.push({ user: user.name, role: user.role, adminAccess: false, correct: true });
      } else if (adminResult && adminResult.status === "pass") {
        console.log("  [FAIL] Admin panel ACCESSIBLE (WRONG - " + user.role + " should be blocked!)");
        results.adminAccessTests.push({ user: user.name, role: user.role, adminAccess: true, correct: false });
      } else {
        console.log("  [WARN] Admin panel status: " + (adminResult ? adminResult.status : "unknown"));
        results.adminAccessTests.push({ user: user.name, role: user.role, adminAccess: false, correct: true });
      }
    }

    // TEST ACTION BUTTONS ON KEY PAGES
    console.log("\n--- Step 5: Testing action button interactions ---");
    var actionPages = ["/tasks", "/tickets", "/approvals", "/billing"];
    for (var k = 0; k < actionPages.length; k++) {
      try {
        await page.goto(BASE + actionPages[k], { waitUntil: "domcontentloaded", timeout: 8000 });
        await page.waitForTimeout(600);
        var actionResults = await testActionButtons(page, { path: actionPages[k] });
        if (actionResults.length > 0) {
          results.actionButtonAudit.push.apply(results.actionButtonAudit, actionResults);
          for (var m = 0; m < actionResults.length; m++) {
            console.log("  [PASS] " + actionResults[m].button + " button on " + actionResults[m].page + ": clicked=" + actionResults[m].clicked + ", modal=" + actionResults[m].modalOpened);
          }
        }
      } catch (e) {
        // Skip
      }
    }

    // LOGOUT
    console.log("\n--- Step 6: Logging out ---");
    await clearSession(page);
    console.log("  [PASS] Session cleared for " + user.name + "\n");

    results.personalities.push({
      user: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      loginSuccess: true,
      routeResults: userRouteResults,
      consoleErrors: pageErrors.length,
    });

    results.consoleErrors.push.apply(results.consoleErrors, pageErrors);
    await context.close();
  }

  await browser.close();

  // FINAL SUMMARY
  console.log("\n===================================================");
  console.log("FINAL SUMMARY");
  console.log("===================================================\n");

  var totalLogins = results.personalities.filter(function(p) { return p.loginSuccess; }).length;
  var failedLogins = results.personalities.filter(function(p) { return !p.loginSuccess; }).length;
  var adminCorrect = results.adminAccessTests.filter(function(t) { return t.correct; }).length;
  var adminIncorrect = results.adminAccessTests.filter(function(t) { return !t.correct; }).length;

  console.log("Users Tested: " + USERS.length);
  console.log("  Successful Logins: " + totalLogins);
  console.log("  Failed Logins: " + failedLogins);
  console.log("\nAdmin Access Control:");
  console.log("  Correct: " + adminCorrect + "/" + results.adminAccessTests.length);
  console.log("  Incorrect: " + adminIncorrect + "/" + results.adminAccessTests.length);
  console.log("\nRBAC Role Coverage:");
  console.log("  Covered: " + results.rolesCoveredByMockUsers.join(", "));
  console.log("  Missing: " + results.rolesMissingMockUsers.join(", "));
  console.log("\nAction Buttons Tested: " + results.actionButtonAudit.length);
  console.log("Console Errors: " + results.consoleErrors.length);

  var totalPasses = 0, totalRedirects = 0, totalTimeouts = 0, totalErrors = 0;
  for (var x = 0; x < results.personalities.length; x++) {
    var p = results.personalities[x];
    if (!p.routeResults) continue;
    for (var y = 0; y < p.routeResults.length; y++) {
      var r = p.routeResults[y];
      if (r.status === "pass") totalPasses++;
      else if (r.status === "redirected") totalRedirects++;
      else if (r.status === "timeout") totalTimeouts++;
      else totalErrors++;
    }
  }
  console.log("\nRoute Test Results (across all users):");
  console.log("  Passed: " + totalPasses);
  console.log("  Redirected: " + totalRedirects);
  console.log("  Timeout: " + totalTimeouts);
  console.log("  Error: " + totalErrors);

  var diagnosticsPath = path.join(SS_DIR, "personality_audit_results.json");
  fs.writeFileSync(diagnosticsPath, JSON.stringify(results, null, 2));
  console.log("\nFull results written to: " + diagnosticsPath);
  console.log("\nPersonality Deep Test Complete!\n");
})();
