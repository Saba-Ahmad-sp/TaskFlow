// Client-side requests go through Next.js API route proxy (same origin, no CORS)
const API_BASE = "/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: { field: string; message: string }[]
  ) {
    super(message);
    this.name = "ApiError";
  }
}

class ApiClient {
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    // If 401, try refreshing the token
    if (res.status === 401) {
      const refreshed = await this.tryRefresh();
      if (refreshed) {
        // Retry original request
        const retryRes = await fetch(`${API_BASE}${endpoint}`, {
          ...options,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
          },
        });
        if (!retryRes.ok) {
          const error = await retryRes.json().catch(() => ({}));
          throw new ApiError(
            retryRes.status,
            error.message || "Request failed",
            error.errors
          );
        }
        return retryRes.json();
      }
      // Refresh failed — redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new ApiError(401, "Session expired");
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new ApiError(
        res.status,
        error.message || "Request failed",
        error.errors
      );
    }

    return res.json();
  }

  private async tryRefresh(): Promise<boolean> {
    if (this.isRefreshing) {
      return this.refreshPromise!;
    }
    this.isRefreshing = true;
    this.refreshPromise = fetch(`/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok)
      .finally(() => {
        this.isRefreshing = false;
        this.refreshPromise = null;
      });
    return this.refreshPromise;
  }
}

export const apiClient = new ApiClient();
