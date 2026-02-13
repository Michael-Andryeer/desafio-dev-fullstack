interface FilterValues {
  nome: string;
  email: string;
  codigoUC: string;
}

const initial: FilterValues = { nome: "", email: "", codigoUC: "" };

let stored: FilterValues = { ...initial };

export const filterStore = {
  get: (): FilterValues => stored,
  set: (values: FilterValues) => {
    stored = { ...values };
  },
};
