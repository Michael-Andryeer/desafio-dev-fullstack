import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SimulationForm } from "@/components/simulation-form";

export const Route = createFileRoute("/simular")({
  component: SimularPage,
});

function SimularPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Simulação de Compensação Energética</CardTitle>
          <CardDescription>
            Preencha seus dados e envie suas contas de energia em PDF para
            simular a compensação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SimulationForm />
        </CardContent>
      </Card>
    </div>
  );
}
