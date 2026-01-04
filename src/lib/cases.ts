/**
 * NoirNote — Demo vakalar
 *
 * Vakalar burada tanımlanır. Tüm metinler text key'leri kullanır.
 */

import type { Case } from "@/types/game";

export const cases: Case[] = [
  {
    id: "case-001",
    titleKey: "cases.case001.title",
    difficulty: "easy",
    suspects: [
      { id: "suspect-001", nameKey: "suspects.suspect001" },
      { id: "suspect-002", nameKey: "suspects.suspect002" },
      { id: "suspect-003", nameKey: "suspects.suspect003" },
    ],
    locations: [
      { id: "location-001", nameKey: "locations.location001" },
      { id: "location-002", nameKey: "locations.location002" },
      { id: "location-003", nameKey: "locations.location003" },
    ],
    items: [
      { id: "item-001", nameKey: "items.item001" },
      { id: "item-002", nameKey: "items.item002" },
      { id: "item-003", nameKey: "items.item003" },
    ],
    clues: [
      "cases.case001.clues.clue1",
      "cases.case001.clues.clue2",
      "cases.case001.clues.clue3",
      "cases.case001.clues.clue4",
      "cases.case001.clues.clue5",
    ],
    solution: {
      suspectId: "suspect-001",
      locationId: "location-002",
      itemId: "item-003",
    },
  },
];

/**
 * ID'ye göre vaka bul
 */
export function getCaseById(caseId: string): Case | undefined {
  return cases.find((c) => c.id === caseId);
}

