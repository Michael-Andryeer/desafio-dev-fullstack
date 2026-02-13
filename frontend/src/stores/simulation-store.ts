interface SimulationValues {
  nomeCompleto: string;
  email: string;
  telefone: string;
}

const initial: SimulationValues = { nomeCompleto: "", email: "", telefone: "" };

let stored: SimulationValues = { ...initial };

export const simulationStore = {
  get: (): SimulationValues => stored,
  set: (values: SimulationValues) => {
    stored = { ...values };
  },
  clear: () => {
    stored = { ...initial };
  },
};
