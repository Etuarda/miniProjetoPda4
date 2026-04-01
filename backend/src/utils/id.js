import { randomUUID } from 'node:crypto';

/**
 * Gera IDs únicos universais usando UUID v4.
 * Garantia estatística de unicidade global sem colisões.
 */
export function generateId() {
  return randomUUID();
}
