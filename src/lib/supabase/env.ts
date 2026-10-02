// Fails loudly when a required variable is missing, instead of building a
// client that silently cannot connect. Only the variable NAME is ever shown.

export function assertEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}
