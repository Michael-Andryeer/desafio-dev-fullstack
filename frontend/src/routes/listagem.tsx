import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/listagem")({
  component: ListagemPage,
});

function ListagemPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Listagem de Simulações</h1>
      <p className="mt-2 text-muted-foreground">
        Tabela será implementada na Fase 8.
      </p>
    </div>
  );
}
