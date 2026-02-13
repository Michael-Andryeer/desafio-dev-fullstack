import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/simular")({
  component: SimularPage,
});

function SimularPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Simulação de Compensação</h1>
      <p className="mt-2 text-muted-foreground">
        Formulário será implementado na Fase 7.
      </p>
    </div>
  );
}
