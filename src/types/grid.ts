/**
 * NoirNote — Grid state types
 *
 * Grid state yapısı:
 * - Cell state: "empty" | "x" | "q" | "check"
 * - 4-state cycle: empty -> x -> q -> check -> empty
 * - Derived X marks: computed at render time from checked cell
 */

export type GridCellState = "empty" | "x" | "q" | "check";

export type CheckedCell = {
  row: number;
  col: number;
} | null;

export type GridState = {
  // Cell states per matrix
  SL: GridCellState[][]; // Suspect x Location (3x3)
  SW: GridCellState[][]; // Suspect x Weapon (3x3)
  LW: GridCellState[][]; // Location x Weapon (3x3)
};

