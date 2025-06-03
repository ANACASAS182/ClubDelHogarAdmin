export function cleanString(value: string | null | undefined, keepNull = true): string | undefined {
  if (value == null) return keepNull ? undefined : '';
  return value.trim();
}