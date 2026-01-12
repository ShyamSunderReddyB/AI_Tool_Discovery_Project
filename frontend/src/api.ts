import { Tool } from "./types";

const BASE = "http://localhost:8000/api";

export async function fetchTools(opts?: {
  q?: string;
  category?: string;
  tag?: string;
}) {
  const params = new URLSearchParams();
  if (opts?.q) params.set("q", opts.q);
  if (opts?.category) params.set("category", opts.category);
  if (opts?.tag) params.set("tag", opts.tag);
  const res = await fetch(`${BASE}/tools?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch tools");
  return (await res.json()) as Tool[];
}

export async function fetchCategories() {
  const res = await fetch(`${BASE}/categories`);
  if (!res.ok) return [];
  return (await res.json()) as string[];
}

export async function fetchTags() {
  const res = await fetch(`${BASE}/tags`);
  if (!res.ok) return [];
  return (await res.json()) as string[];
}

export async function fetchToolById(id: string) {
  const res = await fetch(`${BASE}/tools/${id}`);
  if (!res.ok) throw new Error("Tool not found");
  return (await res.json()) as Tool;
}

export async function createTool(payload: Omit<Tool, "id">) {
  const res = await fetch(`${BASE}/tools`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create tool");
  return (await res.json()) as Tool;
}
