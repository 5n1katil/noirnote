/**
 * NoirNote — Oyun tip tanımları
 *
 * Case (Vaka) sisteminin temel tipleri.
 */

export type Suspect = {
  id: string;
  nameKey: string;
};

export type Location = {
  id: string;
  nameKey: string;
};

export type Item = {
  id: string;
  nameKey: string;
};

export type Case = {
  id: string;
  titleKey: string;
  difficulty: "easy" | "medium" | "hard";
  suspects: Suspect[];
  locations: Location[];
  items: Item[];
  clues: string[]; // Text keys
  solution: {
    suspectId: string;
    locationId: string;
    itemId: string;
  };
};

export type PlayerResult = {
  caseId: string;
  durationSeconds: number;
  attempts: number;
  completedAt: number; // Timestamp
};

