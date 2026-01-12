export type PricingModel =
  | "free"
  | "paid"
  | "subscription"
  | "free_plus_paid"
  | "no_pricing";

export interface Tool {
  id: string;
  name: string;
  shortDescription: string;
  category: string;
  pricingDisplay: string;
  pricingModel: PricingModel;
  officialUrl?: string | null;
  sourceUrl: string;
  releasedAgo: string;
  views?: number | null;
  votes?: number | null;
  rating?: number | null;
  logoUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
  avgRating: number;
  reviewCount: number;
}

export interface ToolCreate {
  name: string;
  shortDescription: string;
  category: string;
  pricingDisplay: string;
  pricingModel: PricingModel;
  officialUrl?: string | null;
  sourceUrl: string;
  releasedAgo?: string;
  logoUrl?: string | null;
}

export interface ToolUpdate extends Partial<ToolCreate> {}

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Review {
  id: string;
  toolId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  moderationNote?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewCreate {
  toolId: string;
  rating: number;
  comment: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

export interface ToolFilters {
  category?: string;
  pricingModel?: PricingModel[];
  minRating?: number;
  search?: string;
  page?: number;
  pageSize?: number;
}
