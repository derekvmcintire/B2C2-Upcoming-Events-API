export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}