/**
 * NoirNote — Demo vakalar
 *
 * Vakalar burada tanımlanır. Tüm metinler text key'leri kullanır.
 */

import type { Case } from "@/types/game";
import { case001 } from "./cases/case-001";
import { case002 } from "./cases/case-002";

export const cases: Case[] = [
  case001,
  case002,
];

/**
 * ID'ye göre vaka bul
 */
export function getCaseById(caseId: string): Case | undefined {
  return cases.find((c) => c.id === caseId);
}

