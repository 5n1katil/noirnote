/**
 * NoirNote — Grid state types
 *
 * Grid state yapısı:
 * - Manual marks: 0 = EMPTY, 1 = QUESTION, 2 = X
 * - Checked cell: stored separately per matrix
 * - Derived X marks: computed at render time from checked cell
 */

export type GridCellState = 0 | 1 | 2; // 0=empty, 1=?, 2=X (manual marks only)

export type CheckedCell = {
  row: number;
  col: number;
} | null;

export type GridState = {
  // Manual marks only (user-set X and ?)
  manual: {
    SL: GridCellState[][]; // Suspect x Location (3x3)
    SW: GridCellState[][]; // Suspect x Weapon (3x3)
    LW: GridCellState[][]; // Location x Weapon (3x3)
  };
  // Checked cell per matrix (only one per matrix)
  checked: {
    SL: CheckedCell;
    SW: CheckedCell;
    LW: CheckedCell;
  };
};

