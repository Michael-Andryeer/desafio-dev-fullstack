import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { LeadFilters as LeadFiltersType } from "@/types/lead";
import { filterStore } from "@/stores/filter-store";

interface LeadFiltersProps {
  onFilterChange: (filters: LeadFiltersType) => void;
  onDebouncingChange: (isDebouncing: boolean) => void;
}

export function LeadFilters({
  onFilterChange,
  onDebouncingChange,
}: LeadFiltersProps) {
  const stored = filterStore.get();
  const [nome, setNome] = useState(stored.nome);
  const [email, setEmail] = useState(stored.email);
  const [codigoUC, setCodigoUC] = useState(stored.codigoUC);
  const isFirstRender = useRef(true);

  useEffect(() => {
    filterStore.set({ nome, email, codigoUC });

    if (isFirstRender.current) {
      isFirstRender.current = false;
      onFilterChange({
        nome: nome || undefined,
        email: email || undefined,
        codigoDaUnidadeConsumidora: codigoUC || undefined,
      });
      return;
    }

    onDebouncingChange(true);

    const timeout = setTimeout(() => {
      onDebouncingChange(false);
      onFilterChange({
        nome: nome || undefined,
        email: email || undefined,
        codigoDaUnidadeConsumidora: codigoUC || undefined,
      });
    }, 800);

    return () => {
      clearTimeout(timeout);
      onDebouncingChange(false);
    };
  }, [nome, email, codigoUC]);

  const handleClear = () => {
    setNome("");
    setEmail("");
    setCodigoUC("");
  };

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="space-y-1">
        <Label htmlFor="filter-nome">Nome</Label>
        <Input
          id="filter-nome"
          placeholder="Buscar por nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-48"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="filter-email">Email</Label>
        <Input
          id="filter-email"
          placeholder="Buscar por email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-48"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="filter-uc">Codigo UC</Label>
        <Input
          id="filter-uc"
          placeholder="Codigo da unidade"
          value={codigoUC}
          onChange={(e) => setCodigoUC(e.target.value)}
          className="w-48"
        />
      </div>
      <Button variant="outline" onClick={handleClear}>
        Limpar
      </Button>
    </div>
  );
}
