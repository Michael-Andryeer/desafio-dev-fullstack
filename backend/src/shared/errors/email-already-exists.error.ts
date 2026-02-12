import { DomainError } from './domain.error';

export class EmailAlreadyExistsError extends DomainError {
  readonly statusCode = 409;

  constructor(email: string) {
    super(`Já existe um lead cadastrado com o email: ${email}`);
  }
}
