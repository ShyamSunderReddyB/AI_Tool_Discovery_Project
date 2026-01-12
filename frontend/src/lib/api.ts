import { Tool, ToolCreate, ToolUpdate, Review, ReviewCreate, User, AuthResponse, PaginatedResponse, ToolFilters, ReviewStatus } from "@/types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `API Error: ${response.status}`);
    }

    return response.json();
  }

  // Public APIs
  async getTools(filters: ToolFilters = {}): Promise<PaginatedResponse<Tool>> {
    const params = new URLSearchParams();
    if (filters.page) params.set("page", filters.page.toString());
    if (filters.pageSize) params.set("pageSize", filters.pageSize.toString());
    if (filters.category) params.set("category", filters.category);
    if (filters.pricingModel?.length) {
      filters.pricingModel.forEach(pm => params.append("pricingModel", pm));
    }
    if (filters.minRating) params.set("minRating", filters.minRating.toString());
    if (filters.search) params.set("search", filters.search);

    return this.request<PaginatedResponse<Tool>>(`/tools?${params.toString()}`);
  }

  async getTool(id: string): Promise<Tool> {
    return this.request<Tool>(`/tools/${id}`);
  }

  async getToolReviews(
    toolId: string,
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResponse<Review>> {
    return this.request<PaginatedResponse<Review>>(
      `/tools/${toolId}/reviews?page=${page}&pageSize=${pageSize}`
    );
  }

  async createReview(data: ReviewCreate): Promise<Review> {
    return this.request<Review>("/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Auth APIs
  async signup(name: string, email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<{ access_token: string; user: any }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    return {
      token: response.access_token,
      user: response.user,
    };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<{ access_token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return {
      token: response.access_token,
      user: response.user,
    };
  }

  // Admin APIs
  async getAdminTools(page = 1, pageSize = 20): Promise<PaginatedResponse<Tool>> {
    return this.request<PaginatedResponse<Tool>>(
      `/admin/tools?page=${page}&pageSize=${pageSize}`
    );
  }

  async createTool(data: ToolCreate): Promise<Tool> {
    return this.request<Tool>("/admin/tools", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateTool(id: string, data: ToolUpdate): Promise<Tool> {
    return this.request<Tool>(`/admin/tools/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteTool(id: string): Promise<void> {
    await this.request(`/admin/tools/${id}`, {
      method: "DELETE",
    });
  }

  async getAdminReviews(
    status?: ReviewStatus,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<Review & { toolName?: string }>> {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("pageSize", pageSize.toString());
    if (status) params.set("status", status);

    return this.request<PaginatedResponse<Review & { toolName?: string }>>(
      `/admin/reviews?${params.toString()}`
    );
  }

  async moderateReview(
    id: string,
    status: "approved" | "rejected",
    moderationNote?: string
  ): Promise<Review> {
    return this.request<Review>(`/admin/reviews/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status, moderationNote }),
    });
  }
}

export const api = new ApiClient();
