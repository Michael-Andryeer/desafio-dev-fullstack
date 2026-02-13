import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  simulationFormSchema,
  type SimulationFormData,
} from "@/schemas/simulation.schema";
import { useCreateLead } from "@/hooks/use-create-lead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/file-upload";

export function SimulationForm() {
  const { mutate, isPending } = useCreateLead();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SimulationFormData>({
    resolver: zodResolver(simulationFormSchema),
    defaultValues: {
      nomeCompleto: "",
      email: "",
      telefone: "",
      files: [],
    },
  });

  const onSubmit = (data: SimulationFormData) => {
    mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="nomeCompleto">Nome completo</Label>
        <Input
          id="nomeCompleto"
          placeholder="João da Silva"
          {...register("nomeCompleto")}
        />
        {errors.nomeCompleto && (
          <p className="text-sm text-destructive">
            {errors.nomeCompleto.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="joao@email.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="telefone">Telefone</Label>
        <Input
          id="telefone"
          placeholder="11999999999"
          {...register("telefone")}
        />
        {errors.telefone && (
          <p className="text-sm text-destructive">{errors.telefone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Contas de energia (PDF)</Label>
        <Controller
          name="files"
          control={control}
          render={({ field }) => (
            <FileUpload
              value={field.value}
              onChange={field.onChange}
              error={errors.files?.message}
            />
          )}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Enviando..." : "Simular compensação"}
      </Button>
    </form>
  );
}
