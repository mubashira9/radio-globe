import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useFavorites() {
  return useQuery({
    queryKey: [api.favorites.list.path],
    queryFn: async () => {
      const res = await fetch(api.favorites.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch favorites");
      const data = await res.json();
      return parseWithLogging(api.favorites.list.responses[200], data, "favorites.list");
    },
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: z.infer<typeof api.favorites.create.input>) => {
      const validated = api.favorites.create.input.parse(input);
      const res = await fetch(api.favorites.create.path, {
        method: api.favorites.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = parseWithLogging(api.favorites.create.responses[400], await res.json(), "favorites.create.400");
          throw new Error(error.message);
        }
        throw new Error("Failed to add favorite");
      }
      return parseWithLogging(api.favorites.create.responses[201], await res.json(), "favorites.create.201");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.favorites.list.path] });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.favorites.delete.path, { id });
      const res = await fetch(url, {
        method: api.favorites.delete.method,
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 404) throw new Error("Favorite not found");
        throw new Error("Failed to remove favorite");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.favorites.list.path] });
    },
  });
}
