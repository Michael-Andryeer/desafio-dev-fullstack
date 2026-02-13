import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import type { LeadFilters } from "@/types/lead";

export function useLeads(filters?: LeadFilters) {
  return useQuery({
    queryKey: ["leads", filters],
    queryFn: () => api.getLeads(filters),
  });
}
