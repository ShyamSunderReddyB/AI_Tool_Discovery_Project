import { Tool, Review, PaginatedResponse } from "@/types";

// Demo data for when the backend is not available
export const demoTools: Tool[] = [
  {
    id: "1",
    name: "ChatGPT",
    shortDescription: "Advanced AI chatbot that can help with writing, coding, analysis, and creative tasks.",
    category: "Text",
    pricingDisplay: "Free + $20/mo",
    pricingModel: "free_plus_paid",
    officialUrl: "https://chat.openai.com",
    sourceUrl: "https://openai.com",
    releasedAgo: "2 years ago",
    views: 15000000,
    votes: 850000,
    rating: 4.8,
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
    createdAt: new Date("2022-11-30"),
    updatedAt: new Date(),
    avgRating: 4.8,
    reviewCount: 12543,
  },
  {
    id: "2",
    name: "Midjourney",
    shortDescription: "AI art generator that creates stunning images from text descriptions.",
    category: "Images",
    pricingDisplay: "From $10/mo",
    pricingModel: "subscription",
    officialUrl: "https://midjourney.com",
    sourceUrl: "https://midjourney.com",
    releasedAgo: "2 years ago",
    views: 8500000,
    votes: 420000,
    rating: 4.9,
    logoUrl: null,
    createdAt: new Date("2022-07-12"),
    updatedAt: new Date(),
    avgRating: 4.9,
    reviewCount: 8721,
  },
  {
    id: "3",
    name: "Claude",
    shortDescription: "Anthropic's AI assistant focused on being helpful, harmless, and honest.",
    category: "Text",
    pricingDisplay: "Free + $20/mo",
    pricingModel: "free_plus_paid",
    officialUrl: "https://claude.ai",
    sourceUrl: "https://anthropic.com",
    releasedAgo: "1 year ago",
    views: 5200000,
    votes: 280000,
    rating: 4.7,
    logoUrl: null,
    createdAt: new Date("2023-03-14"),
    updatedAt: new Date(),
    avgRating: 4.7,
    reviewCount: 5432,
  },
  {
    id: "4",
    name: "DALL-E 3",
    shortDescription: "OpenAI's latest text-to-image model with improved accuracy and creativity.",
    category: "Images",
    pricingDisplay: "$0.04/image",
    pricingModel: "paid",
    officialUrl: "https://openai.com/dall-e-3",
    sourceUrl: "https://openai.com",
    releasedAgo: "1 year ago",
    views: 4800000,
    votes: 195000,
    rating: 4.6,
    logoUrl: null,
    createdAt: new Date("2023-10-04"),
    updatedAt: new Date(),
    avgRating: 4.6,
    reviewCount: 3892,
  },
  {
    id: "5",
    name: "GitHub Copilot",
    shortDescription: "AI pair programmer that helps you write code faster with suggestions.",
    category: "Code",
    pricingDisplay: "$10/mo",
    pricingModel: "subscription",
    officialUrl: "https://github.com/features/copilot",
    sourceUrl: "https://github.com",
    releasedAgo: "2 years ago",
    views: 7200000,
    votes: 380000,
    rating: 4.5,
    logoUrl: null,
    createdAt: new Date("2022-06-21"),
    updatedAt: new Date(),
    avgRating: 4.5,
    reviewCount: 6721,
  },
  {
    id: "6",
    name: "Runway Gen-2",
    shortDescription: "AI video generation tool for creating and editing videos from text.",
    category: "Video",
    pricingDisplay: "From $12/mo",
    pricingModel: "subscription",
    officialUrl: "https://runwayml.com",
    sourceUrl: "https://runwayml.com",
    releasedAgo: "1 year ago",
    views: 2100000,
    votes: 95000,
    rating: 4.4,
    logoUrl: null,
    createdAt: new Date("2023-06-15"),
    updatedAt: new Date(),
    avgRating: 4.4,
    reviewCount: 2156,
  },
  {
    id: "7",
    name: "ElevenLabs",
    shortDescription: "AI voice synthesis and cloning with remarkably natural results.",
    category: "Audio",
    pricingDisplay: "Free + $5/mo",
    pricingModel: "free_plus_paid",
    officialUrl: "https://elevenlabs.io",
    sourceUrl: "https://elevenlabs.io",
    releasedAgo: "2 years ago",
    views: 3400000,
    votes: 145000,
    rating: 4.7,
    logoUrl: null,
    createdAt: new Date("2022-11-28"),
    updatedAt: new Date(),
    avgRating: 4.7,
    reviewCount: 4123,
  },
  {
    id: "8",
    name: "Notion AI",
    shortDescription: "AI writing assistant integrated directly into Notion workspaces.",
    category: "Productivity",
    pricingDisplay: "$10/mo",
    pricingModel: "subscription",
    officialUrl: "https://notion.so",
    sourceUrl: "https://notion.so",
    releasedAgo: "1 year ago",
    views: 4100000,
    votes: 175000,
    rating: 4.3,
    logoUrl: null,
    createdAt: new Date("2023-02-22"),
    updatedAt: new Date(),
    avgRating: 4.3,
    reviewCount: 3567,
  },
  {
    id: "9",
    name: "Jasper AI",
    shortDescription: "AI content platform for marketing teams and content creators.",
    category: "Marketing",
    pricingDisplay: "From $49/mo",
    pricingModel: "subscription",
    officialUrl: "https://jasper.ai",
    sourceUrl: "https://jasper.ai",
    releasedAgo: "3 years ago",
    views: 2800000,
    votes: 125000,
    rating: 4.2,
    logoUrl: null,
    createdAt: new Date("2021-01-15"),
    updatedAt: new Date(),
    avgRating: 4.2,
    reviewCount: 2934,
  },
  {
    id: "10",
    name: "Perplexity AI",
    shortDescription: "AI-powered search engine that provides accurate, cited answers.",
    category: "Research",
    pricingDisplay: "Free + $20/mo",
    pricingModel: "free_plus_paid",
    officialUrl: "https://perplexity.ai",
    sourceUrl: "https://perplexity.ai",
    releasedAgo: "2 years ago",
    views: 5600000,
    votes: 220000,
    rating: 4.6,
    logoUrl: null,
    createdAt: new Date("2022-08-20"),
    updatedAt: new Date(),
    avgRating: 4.6,
    reviewCount: 4892,
  },
  {
    id: "11",
    name: "Suno",
    shortDescription: "AI music generation tool that creates songs from text prompts.",
    category: "Audio",
    pricingDisplay: "Free + $10/mo",
    pricingModel: "free_plus_paid",
    officialUrl: "https://suno.ai",
    sourceUrl: "https://suno.ai",
    releasedAgo: "1 year ago",
    views: 1800000,
    votes: 85000,
    rating: 4.5,
    logoUrl: null,
    createdAt: new Date("2023-09-10"),
    updatedAt: new Date(),
    avgRating: 4.5,
    reviewCount: 1876,
  },
  {
    id: "12",
    name: "Stable Diffusion",
    shortDescription: "Open-source AI image generation model with extensive customization.",
    category: "Images",
    pricingDisplay: "Free",
    pricingModel: "free",
    officialUrl: "https://stability.ai",
    sourceUrl: "https://stability.ai",
    releasedAgo: "2 years ago",
    views: 9200000,
    votes: 520000,
    rating: 4.4,
    logoUrl: null,
    createdAt: new Date("2022-08-22"),
    updatedAt: new Date(),
    avgRating: 4.4,
    reviewCount: 7234,
  },
];

export const demoReviews: Review[] = [
  {
    id: "r1",
    toolId: "1",
    userId: "u1",
    userName: "Sarah Chen",
    rating: 5,
    comment: "ChatGPT has completely transformed how I approach writing and research. The quality of responses is incredible.",
    status: "approved",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "r2",
    toolId: "1",
    userId: "u2",
    userName: "Mike Johnson",
    rating: 4,
    comment: "Great for brainstorming and drafting. Sometimes needs fact-checking but overall a productivity booster.",
    status: "approved",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
  },
  {
    id: "r3",
    toolId: "1",
    userId: "u3",
    userName: "Emily Davis",
    rating: 5,
    comment: "As a developer, I use it daily for debugging and explaining code. Highly recommended!",
    status: "approved",
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-05"),
  },
];

// Helper function to simulate API response
export function getDemoTools(filters?: {
  category?: string;
  pricingModel?: string[];
  minRating?: number;
  search?: string;
  page?: number;
  pageSize?: number;
}): PaginatedResponse<Tool> {
  let filtered = [...demoTools];

  if (filters?.category && filters.category !== "All") {
    filtered = filtered.filter((t) => t.category === filters.category);
  }

  if (filters?.pricingModel?.length) {
    filtered = filtered.filter((t) => filters.pricingModel!.includes(t.pricingModel));
  }

  if (filters?.minRating) {
    filtered = filtered.filter((t) => t.avgRating >= filters.minRating!);
  }

  if (filters?.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.name.toLowerCase().includes(search) ||
        t.shortDescription.toLowerCase().includes(search)
    );
  }

  const page = filters?.page || 1;
  const pageSize = filters?.pageSize || 12;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    items: filtered.slice(start, end),
    total: filtered.length,
    page,
    pageSize,
    totalPages: Math.ceil(filtered.length / pageSize),
  };
}

export function getDemoTool(id: string): Tool | undefined {
  return demoTools.find((t) => t.id === id);
}

export function getDemoToolReviews(
  toolId: string,
  page = 1,
  pageSize = 10
): PaginatedResponse<Review> {
  const reviews = demoReviews.filter((r) => r.toolId === toolId);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    items: reviews.slice(start, end),
    total: reviews.length,
    page,
    pageSize,
    totalPages: Math.ceil(reviews.length / pageSize),
  };
}
