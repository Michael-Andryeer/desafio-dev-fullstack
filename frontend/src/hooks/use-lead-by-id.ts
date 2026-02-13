import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

export function useLeadById(id: string | null) {
  return useQuery({
    queryKey: ["leads", id],
    queryFn: () => api.getLeadById(id!),
    enabled: !!id,
  });
}
