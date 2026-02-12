import { DomainError } from './domain.error';

export class NoFilesProvidedError extends DomainError {
  readonly statusCode = 400;

  constructor() {
    super('Envie pelo menos uma conta de energia');
  }
}
