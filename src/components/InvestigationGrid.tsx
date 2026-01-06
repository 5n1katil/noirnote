"use client";

/**
 * NoirNote — Investigation Grid Component
 *
 * Wrapper component that manages grid state and renders LNotebookGrid.
 * Handles localStorage persistence and entity info cards.
 */

import { useEffect, useState, useCallback } from "react";
import type { Case } from "@/types/game";
import type { GridState, GridCellState } from "@/types/grid";
import { textsTR } from "@/lib/texts.tr";
import { getText } from "@/lib/text-resolver";
import LNotebookGrid from "./LNotebookGrid";

type InvestigationGridProps = {
  caseData: Case;
};

type EntityInfoCardProps = {
  name: string;
  icon: string;
  onClose: () => void;
};

function EntityInfoCard({ name, icon, onClose }: EntityInfoCardProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative mx-4 w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-white transition-colors"
        >
          {textsTR.common.close}
        </button>
        <div className="text-center">
          <div className="text-4xl mb-3">{icon}</div>
          <h3 className="text-xl font-semibold text-white mb-2">{name}</h3>
          <p className="text-sm text-zinc-400">{textsTR.common.about}</p>
        </div>
      </div>
    </div>
  );
}

// Next cycle function: empty -> x -> check -> q -> empty
function nextCycle(current: GridCellState): GridCellState {
  switch (current) {
    case "empty":
      return "x";
    case "x":
      return "check";
    case "check":
      return "q";
    case "q":
      return "empty";
    default:
      return "empty";
  }
}

export default function InvestigationGrid({ caseData }: InvestigationGridProps) {
  // Initial empty state
  const getInitialState = (): GridState => {
    const emptyGrid: GridCellState[][] = [
      ["empty", "empty", "empty"],
      ["empty", "empty", "empty"],
      ["empty", "empty", "empty"],
    ];
    return {
      SL: emptyGrid,
      SW: emptyGrid,
      LW: emptyGrid,
    };
  };

  const [gridState, setGridState] = useState<GridState>(() => getInitialState());
  const [infoCard, setInfoCard] = useState<{
    name: string;
    icon: string;
  } | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const storageKey = `noirnote:grid:${caseData.id}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate structure
        if (
          parsed.SL &&
          parsed.SW &&
          parsed.LW &&
          Array.isArray(parsed.SL) &&
          Array.isArray(parsed.SW) &&
          Array.isArray(parsed.LW)
        ) {
          setGridState(parsed as GridState);
        } else {
          localStorage.removeItem(storageKey);
        }
      }
    } catch (e) {
      console.error("Failed to load grid state", e);
      localStorage.removeItem(storageKey);
    }
  }, [caseData.id]);

  // Save to localStorage whenever gridState changes
  useEffect(() => {
    const storageKey = `noirnote:grid:${caseData.id}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(gridState));
    } catch (e) {
      console.error("Failed to save grid state", e);
    }
  }, [gridState, caseData.id]);

  // Handle cell click
  const handleCellClick = useCallback(
    (section: "SW" | "SL" | "LW", row: number, col: number) => {
      setGridState((prev) => {
        const grid = [...prev[section]];
        const rowCopy = [...grid[row]];
        const currentState = rowCopy[col] as GridCellState;

        // Simply cycle to next state - each cell is independent
        const nextState = nextCycle(currentState);
        rowCopy[col] = nextState;

        grid[row] = rowCopy;
        const newState = { ...prev, [section]: grid };

        // Debug logging
        const finalState = newState[section][row][col];
        console.log("[CELL CLICK]", {
          section,
          row,
          col,
          prev: currentState,
          next: finalState,
        });

        return newState;
      });
    },
    []
  );

  // Handle header click (show info card)
  const handleHeaderClick = useCallback(
    (type: "suspect" | "weapon" | "location", id: string) => {
      let entity;
      if (type === "suspect") {
        entity = caseData.suspects.find((s) => s.id === id);
      } else if (type === "weapon") {
        entity = caseData.weapons.find((w) => w.id === id);
      } else {
        entity = caseData.locations.find((l) => l.id === id);
      }

      if (entity) {
        setInfoCard({
          name: getText(entity.nameKey),
          icon: getText(entity.iconKey),
        });
      }
    },
    [caseData]
  );

  return (
    <>
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white">
          {textsTR.grid.title}
        </h2>

        {/* L-shaped notebook grid */}
        <div className="overflow-x-auto">
          <LNotebookGrid
            suspects={caseData.suspects}
            weapons={caseData.weapons}
            locations={caseData.locations}
            gridState={gridState}
            onCellClick={handleCellClick}
            onHeaderClick={handleHeaderClick}
          />
        </div>
      </div>

      {/* Info Card Modal */}
      {infoCard && (
        <EntityInfoCard
          name={infoCard.name}
          icon={infoCard.icon}
          onClose={() => setInfoCard(null)}
        />
      )}
    </>
  );
}
