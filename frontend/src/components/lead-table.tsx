import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Lead } from "@/types/lead";

interface LeadTableProps {
  leads: Lead[];
  isLoading: boolean;
  onSelectLead: (id: string) => void;
}

export function LeadTable({ leads, isLoading, onSelectLead }: LeadTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <p className="text-lg font-medium text-muted-foreground">
          Nenhuma simulacao encontrada
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Registre uma simulacao na pagina Simular.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Telefone</TableHead>
          <TableHead className="text-center">Unidades</TableHead>
          <TableHead>Data</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map((lead) => (
          <TableRow
            key={lead.id}
            className="cursor-pointer"
            onClick={() => onSelectLead(lead.id)}
          >
            <TableCell className="font-medium">{lead.nomeCompleto}</TableCell>
            <TableCell>{lead.email}</TableCell>
            <TableCell>{lead.telefone}</TableCell>
            <TableCell className="text-center">
              {lead.unidades.length}
            </TableCell>
            <TableCell>
              {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
