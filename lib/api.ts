const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface RegisterData {
  email: string;
  plainPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface ApiError {
  message: string;
  violations?: Array<{
    propertyPath: string;
    message: string;
  }>;
}

export const api = {
  async register(data: RegisterData) {
    const response = await fetch(`${API_URL}/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw result as ApiError;
    }

    return result;
  },

  async login(data: LoginData) {
    const response = await fetch(`${API_URL}/api/login_check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json();
      if (err.message?.toLowerCase().includes("verified")) {
        throw { requiresVerification: true, message: err.message };
      }
      throw new Error(err.message || "Invalid credentials");
    }

    const { token } = await response.json();

    // Decode JWT payload (no serverless, safe, no crypto needed)
    const payload = JSON.parse(atob(token.split(".")[1]));

    const userData = {
      id: payload.id,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      phoneNumber: payload.phoneNumber || null,
      roles: payload.roles,
      isVerified: payload.isVerified,
    };

    return { token, user: userData };
  },

  async verifyEmail(token: string) {
    const response = await fetch(`${API_URL}/api/verify-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Verification failed");
    }

    return result;
  },

  async forgotPassword(email: string) {
    const response = await fetch(`${API_URL}/api/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Request failed");
    }

    return result;
  },

  async resetPassword(token: string, plainPassword: string) {
    const response = await fetch(`${API_URL}/api/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, plainPassword }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Reset failed");
    }

    return result;
  },

  async resendVerification(email: string) {
    const response = await fetch(`${API_URL}/api/resend-verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Request failed");
    }

    return result;
  },

  async getUser(token: string, userId: number) {
    const response = await fetch(`${API_URL}/api/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }

    return result;
  },

  // UPDATED: Fixed header merging - custom headers can now override defaults
  async authenticatedFetch(
    url: string,
    token: string | null,
    options: RequestInit = {}
  ) {
    if (!token) throw new Error("No token available");

    return fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/ld+json",
        // Custom headers come last so they can override defaults
        ...options.headers,
      },
    });
  },
};