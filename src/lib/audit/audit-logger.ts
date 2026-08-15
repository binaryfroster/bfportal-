import { AuditLogEntry, User } from "@/src/types";

export function logAuditEvent(
  user: User | null | undefined,
  action: string,
  resource: string,
  result: "SUCCESS" | "FAILURE" | "DENIED" = "SUCCESS"
): AuditLogEntry {
  const entry: AuditLogEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    actorName: user?.name || "Anonymous",
    actorRole: user?.role || "guest",
    action,
    resource,
    result,
    timestamp: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const existingLogsRaw = localStorage.getItem("bf_audit_logs");
      const existingLogs: AuditLogEntry[] = existingLogsRaw ? JSON.parse(existingLogsRaw) : [];
      const updated = [entry, ...existingLogs].slice(0, 100);
      localStorage.setItem("bf_audit_logs", JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to store audit log", err);
    }
  }

  return entry;
}

export function getAuditLogs(): AuditLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("bf_audit_logs");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
