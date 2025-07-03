// src/services/items.ts
import { api } from "./api";

export const searchItems = (q: string, limit = 8) => {
  if (/^\d+$/.test(q.trim())) {
    return api.get("/api/items/search", { params: { id: q.trim() } })
              .then(r => ({ results: [r.data] }));   // força array
  }
  return api.get("/api/items/search", { params: { q, limit } });
};