import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useLeadById } from "@/hooks/use-lead-by-id";
import type { Unidade, Consumo } from "@/types/lead";

interface LeadDetailDialogProps {
  leadId: string | null;
  open: boolean;
  onClose: () => void;
}

export function LeadDetailDialog({
  leadId,
  open,
  onClose,
}: LeadDetailDialogProps) {
  const { data: lead, isLoading } = useLeadById(leadId);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Simulacao</DialogTitle>
        </DialogHeader>

        {isLoading && <p className="text-muted-foreground">Carregando...</p>}

        {lead && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{lead.nomeCompleto}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{lead.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-medium">{lead.telefone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data</p>
                <p className="font-medium">
                  {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>

            {lead.unidades.map((unidade: Unidade, index: number) => (
              <div
                key={unidade.id}
                className="space-y-3 rounded-lg border p-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Unidade {index + 1}</h4>
                  <div className="flex gap-2">
                    <Badge variant="outline">{unidade.enquadramento}</Badge>
                    <Badge variant="secondary">{unidade.modeloFasico}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Codigo UC</p>
                    <p>{unidade.codigoDaUnidadeConsumidora}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Valor (R$)</p>
                    <p>{unidade.consumoEmReais}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Mes de referencia</p>
                    <p>
                      {new Date(unidade.mesDeReferencia).toLocaleDateString(
                        "pt-BR",
                      )}
                    </p>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mes</TableHead>
                      <TableHead className="text-right">
                        Consumo fora ponta (kWh)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unidade.consumos.map((consumo: Consumo) => (
                      <TableRow key={consumo.id}>
                        <TableCell>
                          {new Date(consumo.mesDoConsumo).toLocaleDateString(
                            "pt-BR",
                            { month: "long", year: "numeric" },
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {consumo.consumoForaPontaEmKWH}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
