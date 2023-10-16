/**
 * Custom error class for token errors.
 */
export class TokenError extends Error {
  constructor(message?: string) {
    super(message);

    this.name = 'TokenError';
  }
}
