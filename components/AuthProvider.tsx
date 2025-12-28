"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "sonner";
import { api, RegisterData, LoginData } from "@/lib/api";
import { getDashboardRoute } from "@/lib/auth-utils";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roles: string[];
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage (and cookie as backup) on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch{
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }
    }
    setLoading(false);
  }, []);

  const login = async (data: LoginData) => {
    try {
      const { token: jwtToken, user: userData } = await api.login(data);

      // Save to localStorage
      localStorage.setItem("token", jwtToken);
      localStorage.setItem("user", JSON.stringify(userData));

      // Critical: Save to cookie for middleware (without secure=true in dev, as it blocks HTTP on localhost)
      const cookieOptions = `token=${jwtToken}; path=/; max-age=3600; samesite=strict${
        process.env.NODE_ENV === 'production' ? '; secure=true' : ''
      }`;
      document.cookie = cookieOptions;

      setToken(jwtToken);
      setUser(userData);

      toast.success(`Welcome back, ${userData.firstName.trim()}!`);

      // Full reload ensures middleware sees the cookie
      window.location.href = getDashboardRoute(userData.roles);
    } catch (error: unknown) {
  if (typeof error === "object" && error !== null) {
    const err = error as { message?: string; requiresVerification?: boolean };

    if (err.requiresVerification) {
      toast.error("Please verify your email first", {
        description: "Check your inbox (and spam folder)",
        duration: 8000,
      });
    } else {
      toast.error(err.message ?? "Invalid credentials");
    }
  } else {
    // Fallback for non-object errors (like strings, numbers)
    toast.error("Invalid credentials");
  }

  throw error; // re-throw if needed
}

  };

  const register = async (data: RegisterData) => {
    try {
      await api.register(data);
      toast.success("Account created! Please check your email to verify.");
      window.location.href = "/login"; // Use full redirect for consistency
    }catch (error: unknown) {
  let message = "Registration failed";

  if (typeof error === "object" && error !== null) {
    const err = error as {
      message?: string;
      violations?: { message: string }[];
    };

    if (Array.isArray(err.violations)) {
      message = err.violations.map((v) => v.message).join(", ");
    } else if (err.message) {
      message = err.message;
    }
  }

  toast.error(message);
  throw error;
}

  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Remove cookie
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    toast.success("Logged out successfully");
    window.location.href = "/login";
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};