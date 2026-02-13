import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useLeads } from "@/hooks/use-leads";
import { LeadFilters } from "@/components/lead-filters";
import { LeadTable } from "@/components/lead-table";
import { LeadDetailDialog } from "@/components/lead-detail-dialog";
import type { LeadFilters as LeadFiltersType } from "@/types/lead";

export const Route = createFileRoute("/listagem")({
  component: ListagemPage,
});

function ListagemPage() {
  const [filters, setFilters] = useState<LeadFiltersType>({});
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const { data: leads = [], isLoading } = useLeads(filters);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Simulações Registradas</h1>

      <LeadFilters onFilterChange={setFilters} />

      <LeadTable
        leads={leads}
        isLoading={isLoading}
        onSelectLead={setSelectedLeadId}
      />

      <LeadDetailDialog
        leadId={selectedLeadId}
        open={!!selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
      />
    </div>
  );
}
