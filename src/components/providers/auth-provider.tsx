"use client";

import * as React from "react";
import { User, UserRole } from "@/src/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, role: UserRole) => Promise<boolean>;
  socialLogin: (provider: string, email: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updatedFields: Partial<User>) => Promise<boolean>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

// Initial mock users from server.ts mock DB
const MOCK_USERS: User[] = [
  {
    id: "admin-shivam",
    name: "Shivam Dube",
    email: "shivam@binaryfroster.com",
    role: "admin",
    companyName: "Binary Froster",
    phone: "+91 98765 43210",
    timezone: "Asia/Kolkata",
    status: "active",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    createdAt: "2026-01-01T00:00:00Z"
  },
  {
    id: "admin-digvijay",
    name: "Digvijay Kadam",
    email: "digvijay@binaryfroster.com",
    role: "admin",
    companyName: "Binary Froster",
    phone: "+91 98765 43211",
    timezone: "Asia/Kolkata",
    status: "active",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    createdAt: "2026-01-01T00:00:00Z"
  },
  {
    id: "admin-jawad",
    name: "Jawad Khan Hakim",
    email: "jawad@binaryfroster.com",
    role: "admin",
    companyName: "Binary Froster",
    phone: "+91 98765 43212",
    timezone: "Asia/Kolkata",
    status: "active",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    createdAt: "2026-01-01T00:00:00Z"
  },
  {
    id: "admin-jawad-personal",
    name: "Jawad Khan Hakim",
    email: "jawadkhanhakim@gmail.com",
    role: "admin",
    companyName: "Binary Froster",
    phone: "+91 98765 43212",
    timezone: "Asia/Kolkata",
    status: "active",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    createdAt: "2026-01-01T00:00:00Z"
  },
  {
    id: "client-john",
    name: "John Sterling",
    email: "john@sterling.com",
    role: "client",
    companyName: "Sterling Capital Group",
    companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
    phone: "+44 20 7946 0192",
    timezone: "Europe/London",
    status: "active",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    createdAt: "2026-04-10T00:00:00Z",
    isTwoFactorEnabled: false
  },
  {
    id: "client-grade",
    name: "Acme Client Profile",
    email: "client@acme.com",
    role: "client",
    companyName: "Acme Enterprises Inc.",
    companyLogo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&auto=format&fit=crop&q=80",
    phone: "+1 202 555 0143",
    timezone: "America/New_York",
    status: "active",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    createdAt: "2026-05-01T00:00:00Z",
    isTwoFactorEnabled: false
  }
];

function getStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem("bf_custom_users");
    const custom: User[] = raw ? JSON.parse(raw) : [];
    return [...MOCK_USERS, ...custom];
  } catch {
    return MOCK_USERS;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Restore session from localStorage if exists
  React.useEffect(() => {
    const savedSession = localStorage.getItem("bf_session");
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setUser(parsed);
        document.cookie = `bf_session=${encodeURIComponent(JSON.stringify(parsed))}; path=/; max-age=1800`;
      } catch (err) {
        console.error("Session restore failed", err);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    const normalizedEmail = email.toLowerCase().trim();
    
    const allUsers = getStoredUsers();
    const matchedUser = allUsers.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!matchedUser) {
      setIsLoading(false);
      throw new Error("Account not found. Client accounts are created exclusively by Binary Froster Admins.");
    }

    if (matchedUser.status === "deactivated") {
      setIsLoading(false);
      throw new Error("Account is deactivated. Contact Binary Froster administrators.");
    }

    setUser(matchedUser);
    localStorage.setItem("bf_session", JSON.stringify(matchedUser));
    document.cookie = `bf_session=${encodeURIComponent(JSON.stringify(matchedUser))}; path=/; max-age=1800`;
    setIsLoading(false);
    return true;
  };

  const socialLogin = async (provider: string, email: string): Promise<boolean> => {
    return login(email, "client");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("bf_session");
    document.cookie = "bf_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  const updateProfile = async (updatedFields: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    const updatedUser = { ...user, ...updatedFields };
    setUser(updatedUser);
    localStorage.setItem("bf_session", JSON.stringify(updatedUser));
    document.cookie = `bf_session=${encodeURIComponent(JSON.stringify(updatedUser))}; path=/; max-age=1800`;
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        socialLogin,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useUser() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useUser must be used within an AuthProvider");
  }
  return context;
}
