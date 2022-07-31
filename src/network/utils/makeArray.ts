export function makeArray<T>(item: T | T[]): T[] {
  return Array.isArray(item) ? item : [item];
}
