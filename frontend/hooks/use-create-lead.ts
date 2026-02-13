import { api } from "./../src/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import type { SimulationFormData } from "../schemas/simulation.schema";

export function useCreateLead() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: SimulationFormData) => {
      const formData = new FormData();
      formData.append("nomeCompleto", data.nomeCompleto);
      formData.append("email", data.email);
      formData.append("telefone", data.telefone);
      data.files.forEach((file) => formData.append("files", file));

      return api.createLead(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Simulação registrada com sucesso!");
      router.navigate({ to: "/listagem" });
    },
    onError: (error: any) => {
      const message = error?.message || "Erro ao registrar simulação";
      toast.error(message);
    },
  });
}
