import { DomainError } from './domain.error';

export class UnitCodeAlreadyExistsError extends DomainError {
  readonly statusCode = 409;

  constructor(code: string) {
    super(`Já existe um lead cadastrado com o código: ${code}`);
  }
}
