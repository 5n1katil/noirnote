"use client";

/**
 * NoirNote — Unified L-Shaped Notebook Grid Component
 *
 * Renders a single unified L-shaped notebook grid with shared headers:
 * - Top row: [KİM icons (3)] then [NEREDE icons (3)]
 * - Left column: [NEYLE icons (3)] then [NEREDE icons (3)]
 * - Three cell blocks:
 *   1) NEYLE × KİM (top-left) - maps to SW state (transposed)
 *   2) NEYLE × NEREDE (top-right) - maps to LW state (transposed)
 *   3) NEREDE × KİM (bottom-left) - maps to SL state (transposed)
 * - Bottom-right quadrant: empty filler
 *
 * Cell cycle: empty -> x -> check -> q -> empty
 * When a cell is checked (✓), same row/col cells in that section show derived X (not clickable)
 */

import { useMemo, useCallback } from "react";
import type { GridState, GridCellState } from "@/types/grid";
import { getText } from "@/lib/text-resolver";

type Entity = {
  id: string;
  nameKey: string;
  iconKey: string;
};

type LNotebookGridProps = {
  suspects: Entity[];
  weapons: Entity[];
  locations: Entity[];
  gridState: GridState;
  onCellClick: (section: "SW" | "SL" | "LW", row: number, col: number) => void;
  onHeaderClick?: (type: "suspect" | "weapon" | "location", id: string) => void;
};

// Get display character for cell state
function getCellDisplay(state: GridCellState, isDerivedX: boolean): {
  char: string;
  bgClass: string;
  textClass: string;
} {
  if (state === "check") {
    return {
      char: "✓",
      bgClass: "bg-green-900/40 hover:bg-green-900/50",
      textClass: "text-green-400",
    };
  }
  if (state === "x") {
    return {
      char: "✕",
      bgClass: "bg-red-900/30 hover:bg-red-900/40",
      textClass: "text-red-400",
    };
  }
  if (state === "q") {
    return {
      char: "?",
      bgClass: "bg-yellow-900/30 hover:bg-yellow-900/40",
      textClass: "text-yellow-400",
    };
  }
  if (isDerivedX) {
    return {
      char: "✕",
      bgClass: "bg-red-900/20 hover:bg-red-900/30",
      textClass: "text-red-500/70",
    };
  }
  return {
    char: "",
    bgClass: "bg-zinc-900 hover:bg-zinc-800",
    textClass: "text-zinc-600",
  };
}

// Get all checked cells from grid
function getCheckedCells(grid: GridCellState[][]): Array<{ row: number; col: number }> {
  const checked: Array<{ row: number; col: number }> = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (grid[row][col] === "check") {
        checked.push({ row, col });
      }
    }
  }
  return checked;
}

// Compute derived X marks for a given grid
function getDerivedXSet(checkedCells: Array<{ row: number; col: number }>): Set<string> {
  const derivedSet = new Set<string>();
  for (const checked of checkedCells) {
    // Mark all cells in same row and column as derived X (except the checked cell itself)
    for (let i = 0; i < 3; i++) {
      // Same row
      if (i !== checked.col) {
        derivedSet.add(`${checked.row},${i}`);
      }
      // Same column
      if (i !== checked.row) {
        derivedSet.add(`${i},${checked.col}`);
      }
    }
  }
  return derivedSet;
}

export default function LNotebookGrid({
  suspects,
  weapons,
  locations,
  gridState,
  onCellClick,
  onHeaderClick,
}: LNotebookGridProps) {
  // Compute derived X sets for all sections (in original state coordinates)
  const derivedXSets = useMemo(() => {
    return {
      SW: getDerivedXSet(getCheckedCells(gridState.SW)),
      SL: getDerivedXSet(getCheckedCells(gridState.SL)),
      LW: getDerivedXSet(getCheckedCells(gridState.LW)),
    };
  }, [gridState]);

  // Adapter functions to get/set cell state with transpose mapping
  const getCellState = useCallback(
    (visualRow: number, visualCol: number): { state: GridCellState; section: "SW" | "SL" | "LW"; isDerivedX: boolean } => {
      // Block 1: NEYLE × KİM (top-left) - rows 0-2, cols 0-2
      // Maps to SW state transposed: visual (weaponRow, suspectCol) -> state (suspectRow, weaponCol)
      // State SW[suspectRow][weaponCol], visual at (weaponRow, suspectCol)
      if (visualRow < 3 && visualCol < 3) {
        const stateRow = visualCol; // KİM index = suspect index in state
        const stateCol = visualRow; // NEYLE index = weapon index in state (transposed)
        const state = gridState.SW[stateRow][stateCol];
        // Check if this state cell is a derived X (transpose the derived set check)
        // Derived set contains state coordinates, so we check directly
        const isDerivedX = derivedXSets.SW.has(`${stateRow},${stateCol}`) && state === "empty";
        return { state, section: "SW", isDerivedX };
      }

      // Block 2: NEYLE × NEREDE (top-right) - rows 0-2, cols 3-5
      // Maps to LW state transposed: visual (weaponRow, locationCol) -> state (locationRow, weaponCol)
      // State LW[locationRow][weaponCol], visual at (weaponRow, locationCol)
      if (visualRow < 3 && visualCol >= 3 && visualCol < 6) {
        const stateRow = visualCol - 3; // NEREDE index = location index in state
        const stateCol = visualRow; // NEYLE index = weapon index in state (transposed)
        const state = gridState.LW[stateRow][stateCol];
        const isDerivedX = derivedXSets.LW.has(`${stateRow},${stateCol}`) && state === "empty";
        return { state, section: "LW", isDerivedX };
      }

      // Block 3: NEREDE × KİM (bottom-left) - rows 3-5, cols 0-2
      // Maps to SL state transposed: visual (locationRow, suspectCol) -> state (suspectRow, locationCol)
      // State SL[suspectRow][locationCol], visual at (locationRow, suspectCol)
      if (visualRow >= 3 && visualRow < 6 && visualCol < 3) {
        const stateRow = visualCol; // KİM index = suspect index in state
        const stateCol = visualRow - 3; // NEREDE index = location index in state (transposed)
        const state = gridState.SL[stateRow][stateCol];
        const isDerivedX = derivedXSets.SL.has(`${stateRow},${stateCol}`) && state === "empty";
        return { state, section: "SL", isDerivedX };
      }

      // Empty filler area
      return { state: "empty", section: "SW", isDerivedX: false };
    },
    [gridState, derivedXSets]
  );

  const handleCellClick = useCallback(
    (visualRow: number, visualCol: number) => {
      // Block 1: NEYLE × KİM -> SW (transposed)
      if (visualRow < 3 && visualCol < 3) {
        const stateRow = visualCol;
        const stateCol = visualRow;
        onCellClick("SW", stateRow, stateCol);
        return;
      }

      // Block 2: NEYLE × NEREDE -> LW (transposed)
      if (visualRow < 3 && visualCol >= 3 && visualCol < 6) {
        const stateRow = visualCol - 3;
        const stateCol = visualRow;
        onCellClick("LW", stateRow, stateCol);
        return;
      }

      // Block 3: NEREDE × KİM -> SL (transposed)
      if (visualRow >= 3 && visualRow < 6 && visualCol < 3) {
        const stateRow = visualCol;
        const stateCol = visualRow - 3;
        onCellClick("SL", stateRow, stateCol);
        return;
      }
    },
    [onCellClick]
  );

  return (
    <div className="inline-block overflow-x-auto">
      {/* Unified L-shaped grid container */}
      <div className="border-4 border-zinc-700 bg-zinc-950 rounded-lg overflow-hidden inline-block">
        <table className="border-collapse">
          {/* Top header row: KİM icons (3) then NEREDE icons (3) */}
          <thead>
            <tr>
              <th className="w-12 h-12 border-r border-b border-zinc-700"></th>
              {/* KİM icons */}
              {suspects.map((suspect) => (
                <th
                  key={suspect.id}
                  className="w-16 h-12 p-1 border-r border-b border-zinc-700"
                >
                  {onHeaderClick ? (
                    <button
                      onClick={() => onHeaderClick("suspect", suspect.id)}
                      className="w-full h-full flex items-center justify-center hover:bg-zinc-800 transition-colors rounded"
                      title={getText(suspect.nameKey)}
                    >
                      <span className="text-xl">{getText(suspect.iconKey)}</span>
                    </button>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" title={getText(suspect.nameKey)}>
                      <span className="text-xl">{getText(suspect.iconKey)}</span>
                    </div>
                  )}
                </th>
              ))}
              {/* NEREDE icons */}
              {locations.map((location) => (
                <th
                  key={location.id}
                  className={`w-16 h-12 p-1 border-r border-b border-zinc-700 ${
                    locations.indexOf(location) === locations.length - 1 ? "border-r-4" : ""
                  }`}
                >
                  {onHeaderClick ? (
                    <button
                      onClick={() => onHeaderClick("location", location.id)}
                      className="w-full h-full flex items-center justify-center hover:bg-zinc-800 transition-colors rounded"
                      title={getText(location.nameKey)}
                    >
                      <span className="text-xl">{getText(location.iconKey)}</span>
                    </button>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" title={getText(location.nameKey)}>
                      <span className="text-xl">{getText(location.iconKey)}</span>
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* NEYLE rows (0-2) */}
            {weapons.map((weapon, weaponIdx) => (
              <tr key={weapon.id}>
                {/* Left header: NEYLE icon */}
                <td className="w-12 h-16 p-1 border-r border-b border-zinc-700">
                  {onHeaderClick ? (
                    <button
                      onClick={() => onHeaderClick("weapon", weapon.id)}
                      className="w-full h-full flex items-center justify-center hover:bg-zinc-800 transition-colors rounded"
                      title={getText(weapon.nameKey)}
                    >
                      <span className="text-xl">{getText(weapon.iconKey)}</span>
                    </button>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" title={getText(weapon.nameKey)}>
                      <span className="text-xl">{getText(weapon.iconKey)}</span>
                    </div>
                  )}
                </td>
                {/* Block 1: NEYLE × KİM (cols 0-2) */}
                {suspects.map((_, suspectIdx) => {
                  const visualRow = weaponIdx;
                  const visualCol = suspectIdx;
                  const { state, isDerivedX } = getCellState(visualRow, visualCol);
                  const display = getCellDisplay(state, isDerivedX);

                  return (
                    <td
                      key={`sw-${suspectIdx}`}
                      className="w-16 h-16 p-1 border-r border-b border-zinc-700 relative"
                    >
                      <button
                        onClick={() => handleCellClick(visualRow, visualCol)}
                        disabled={isDerivedX}
                        className={`w-full h-full rounded transition-colors relative ${display.bgClass} ${
                          isDerivedX ? "cursor-not-allowed opacity-80" : ""
                        }`}
                      >
                        <div className="absolute inset-0 z-0"></div>
                        {display.char && (
                          <span
                            className={`absolute inset-0 flex items-center justify-center z-10 text-2xl font-bold leading-none text-zinc-100 ${display.textClass}`}
                          >
                            {display.char}
                          </span>
                        )}
                      </button>
                    </td>
                  );
                })}
                {/* Block 2: NEYLE × NEREDE (cols 3-5) */}
                {locations.map((_, locationIdx) => {
                  const visualRow = weaponIdx;
                  const visualCol = 3 + locationIdx;
                  const { state, isDerivedX } = getCellState(visualRow, visualCol);
                  const display = getCellDisplay(state, isDerivedX);
                  const isLastCol = locationIdx === locations.length - 1;

                  return (
                    <td
                      key={`lw-${locationIdx}`}
                      className={`w-16 h-16 p-1 border-r border-b border-zinc-700 relative ${
                        isLastCol ? "border-r-4" : ""
                      }`}
                    >
                      <button
                        onClick={() => handleCellClick(visualRow, visualCol)}
                        disabled={isDerivedX}
                        className={`w-full h-full rounded transition-colors relative ${display.bgClass} ${
                          isDerivedX ? "cursor-not-allowed opacity-80" : ""
                        }`}
                      >
                        <div className="absolute inset-0 z-0"></div>
                        {display.char && (
                          <span
                            className={`absolute inset-0 flex items-center justify-center z-10 text-2xl font-bold leading-none text-zinc-100 ${display.textClass}`}
                          >
                            {display.char}
                          </span>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
            {/* Divider row between NEYLE and NEREDE sections */}
            <tr>
              <td colSpan={7} className="h-0 p-0 border-b-4 border-zinc-700"></td>
            </tr>
            {/* NEREDE rows (3-5) */}
            {locations.map((location, locationIdx) => (
              <tr key={location.id}>
                {/* Left header: NEREDE icon */}
                <td className="w-12 h-16 p-1 border-r border-b border-zinc-700">
                  {onHeaderClick ? (
                    <button
                      onClick={() => onHeaderClick("location", location.id)}
                      className="w-full h-full flex items-center justify-center hover:bg-zinc-800 transition-colors rounded"
                      title={getText(location.nameKey)}
                    >
                      <span className="text-xl">{getText(location.iconKey)}</span>
                    </button>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" title={getText(location.nameKey)}>
                      <span className="text-xl">{getText(location.iconKey)}</span>
                    </div>
                  )}
                </td>
                {/* Block 3: NEREDE × KİM (cols 0-2) */}
                {suspects.map((_, suspectIdx) => {
                  const visualRow = 3 + locationIdx;
                  const visualCol = suspectIdx;
                  const { state, isDerivedX } = getCellState(visualRow, visualCol);
                  const display = getCellDisplay(state, isDerivedX);

                  return (
                    <td
                      key={`sl-${suspectIdx}`}
                      className="w-16 h-16 p-1 border-r border-b border-zinc-700 relative"
                    >
                      <button
                        onClick={() => handleCellClick(visualRow, visualCol)}
                        disabled={isDerivedX}
                        className={`w-full h-full rounded transition-colors relative ${display.bgClass} ${
                          isDerivedX ? "cursor-not-allowed opacity-80" : ""
                        }`}
                      >
                        <div className="absolute inset-0 z-0"></div>
                        {display.char && (
                          <span
                            className={`absolute inset-0 flex items-center justify-center z-10 text-2xl font-bold leading-none text-zinc-100 ${display.textClass}`}
                          >
                            {display.char}
                          </span>
                        )}
                      </button>
                    </td>
                  );
                })}
                {/* Empty filler cells (cols 3-5) */}
                {locations.map((_, idx) => {
                  const isLastCol = idx === locations.length - 1;
                  return (
                    <td
                      key={`filler-${idx}`}
                      className={`w-16 h-16 p-1 border-r border-b border-zinc-700 bg-zinc-950 ${
                        isLastCol ? "border-r-4" : ""
                      }`}
                    ></td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/*
TEST STEPS:
1. Open /case/case-001
2. Verify single unified L-shaped board exists
3. Verify layout:
   - Top row headers: 3 KİM icons then 3 NEREDE icons
   - Left column headers: 3 NEYLE icons then 3 NEREDE icons
   - Block 1 (top-left): NEYLE × KİM (3x3)
   - Block 2 (top-right): NEYLE × NEREDE (3x3)
   - Block 3 (bottom-left): NEREDE × KİM (3x3)
   - Block 4 (bottom-right): Empty filler (3x3)
4. Click any cell in Block 1: X -> ✓ -> ? -> empty (cycle works)
5. Click a cell in Block 1 to set ✓: Other cells in same row/col within Block 1 auto-become X (derived)
6. Verify derived X cells are not clickable (disabled)
7. Repeat steps 4-6 for Block 2 and Block 3
8. Verify state persists after page refresh (localStorage)
9. Test responsive: On mobile, grid should scroll horizontally if needed
*/
