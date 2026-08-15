import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";

// Tailwind class name merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency (USD)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format size in bytes to human-readable string
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

// Format date to local/desired timezone or simple format
export function formatDate(dateString: string | null | undefined, formatStr = "MMM dd, yyyy", timeZone?: string): string {
  if (!dateString) return "N/A";
  try {
    const date = parseISO(dateString);
    if (timeZone) {
      const zonedDate = toZonedTime(date, timeZone);
      return format(zonedDate, formatStr);
    }
    return format(date, formatStr);
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
}

// Generate initials from name
export function getInitials(name: string): string {
  if (!name) return "";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
