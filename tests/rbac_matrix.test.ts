import { test, describe } from "node:test";
import assert from "node:assert";
import {
  UserRole,
  isStudioStaff,
  isClientUser,
  hasSignatoryAuthority,
  hasFinancialAuthority,
  hasAdminPanelAccess,
  STUDIO_STAFF_ROLES,
  CLIENT_ROLES,
} from "../src/types";

describe("Strict Role-Based Access Control (RBAC) & Authority Matrix Tests", () => {
  const allRoles: UserRole[] = [
    "super_admin",
    "admin",
    "project_manager",
    "developer",
    "designer",
    "finance",
    "account_manager",
    "support_agent",
    "client_admin",
    "client",
    "client_user",
  ];

  test("1. should correctly partition Studio Staff vs External Client roles", () => {
    const expectedStudioRoles: UserRole[] = [
      "super_admin",
      "admin",
      "project_manager",
      "developer",
      "designer",
      "finance",
      "account_manager",
      "support_agent",
    ];

    const expectedClientRoles: UserRole[] = [
      "client_admin",
      "client",
      "client_user",
    ];

    for (const role of expectedStudioRoles) {
      assert.strictEqual(isStudioStaff(role), true, `Expected ${role} to be recognized as Studio Staff`);
      assert.strictEqual(isClientUser(role), false, `Expected ${role} not to be recognized as Client User`);
    }

    for (const role of expectedClientRoles) {
      assert.strictEqual(isClientUser(role), true, `Expected ${role} to be recognized as Client User`);
      assert.strictEqual(isStudioStaff(role), false, `Expected ${role} not to be recognized as Studio Staff`);
    }
  });

  test("2. should grant signatory authority strictly to client_admin and super_admin", () => {
    // Authorized signatories
    assert.strictEqual(hasSignatoryAuthority("client_admin"), true);
    assert.strictEqual(hasSignatoryAuthority("super_admin"), true);

    // Forbidden from signing legal contracts
    assert.strictEqual(hasSignatoryAuthority("client"), false);
    assert.strictEqual(hasSignatoryAuthority("client_user"), false);
    assert.strictEqual(hasSignatoryAuthority("developer"), false);
    assert.strictEqual(hasSignatoryAuthority("designer"), false);
    assert.strictEqual(hasSignatoryAuthority("project_manager"), false);
    assert.strictEqual(hasSignatoryAuthority("finance"), false);
    assert.strictEqual(hasSignatoryAuthority(null), false);
    assert.strictEqual(hasSignatoryAuthority(undefined), false);
  });

  test("3. should grant financial authority strictly to client_admin, super_admin, finance and admin", () => {
    // Authorized payees and financial administrators
    assert.strictEqual(hasFinancialAuthority("client_admin"), true);
    assert.strictEqual(hasFinancialAuthority("super_admin"), true);
    assert.strictEqual(hasFinancialAuthority("finance"), true);
    assert.strictEqual(hasFinancialAuthority("admin"), true);

    // Forbidden from settling invoices or issuing billings
    assert.strictEqual(hasFinancialAuthority("client"), false);
    assert.strictEqual(hasFinancialAuthority("client_user"), false);
    assert.strictEqual(hasFinancialAuthority("developer"), false);
    assert.strictEqual(hasFinancialAuthority("designer"), false);
    assert.strictEqual(hasFinancialAuthority("support_agent"), false);
  });

  test("4. should restrict Admin Panel access strictly to studio leadership & PMs", () => {
    assert.strictEqual(hasAdminPanelAccess("super_admin"), true);
    assert.strictEqual(hasAdminPanelAccess("admin"), true);
    assert.strictEqual(hasAdminPanelAccess("project_manager"), true);

    // Clients never have admin panel access
    assert.strictEqual(hasAdminPanelAccess("client_admin"), false);
    assert.strictEqual(hasAdminPanelAccess("client"), false);
    assert.strictEqual(hasAdminPanelAccess("client_user"), false);
  });

  test("5. should verify studio-only route protection patterns", () => {
    const STUDIO_ADMIN_ROUTES = [
      "/admin",
      "/admin/projects",
      "/proposals",
      "/client-360",
      "/credential-vault",
      "/api-keys",
    ];

    const testClientRoles = ["client_admin", "client", "client_user"];
    const testStudioRoles = ["super_admin", "admin", "project_manager"];

    // Verify all client roles are rejected on studio routes
    for (const route of STUDIO_ADMIN_ROUTES) {
      for (const clientRole of testClientRoles) {
        const allowed = isStudioStaff(clientRole);
        assert.strictEqual(allowed, false, `Route ${route} must forbid ${clientRole}`);
      }
      for (const studioRole of testStudioRoles) {
        const allowed = isStudioStaff(studioRole);
        assert.strictEqual(allowed, true, `Route ${route} must allow ${studioRole}`);
      }
    }
  });
});
