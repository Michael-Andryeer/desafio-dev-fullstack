import type { Lead, LeadFilters } from "@/types/lead";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const api = {
  async createLead(formData: FormData): Promise<Lead> {
    const response = await fetch(`${API_URL}/leads`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return response.json();
  },

  async getLeads(filters?: LeadFilters): Promise<Lead[]> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          params.set(key, String(value));
        }
      });
    }

    const query = params.toString();
    const response = await fetch(`${API_URL}/leads${query ? `?${query}` : ""}`);

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return response.json();
  },

  async getLeadById(id: string): Promise<Lead> {
    const response = await fetch(`${API_URL}/leads/${id}`);

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return response.json();
  },
};
