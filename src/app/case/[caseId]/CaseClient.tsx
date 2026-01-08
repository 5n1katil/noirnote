"use client";

/**
 * Client wrapper for case page - handles InvestigationGrid and FinalDeduction
 */

import { useState, useEffect } from "react";
import type { Case } from "@/types/game";
import { textsTR } from "@/lib/texts.tr";
import { getText } from "@/lib/text-resolver";
import InvestigationGrid from "@/components/InvestigationGrid";
import ResultModal from "./ResultModal";
import { saveCaseResult } from "@/lib/caseResult.client";

type CaseClientProps = {
  caseData: Case;
};

type ResultState = {
  type: "success" | "failure";
  duration: number;
  attempts: number;
} | null;

export default function CaseClient({ caseData }: CaseClientProps) {
  const [finalSuspect, setFinalSuspect] = useState<string>("");
  const [finalLocation, setFinalLocation] = useState<string>("");
  const [finalWeapon, setFinalWeapon] = useState<string>("");
  const [duration, setDuration] = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [resultState, setResultState] = useState<ResultState>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const allSelected = finalSuspect && finalLocation && finalWeapon;
  const isModalOpen = resultState !== null;

  // Timer tracking
  useEffect(() => {
    const startTimeKey = `noirnote:start:${caseData.id}`;
    const stored = localStorage.getItem(startTimeKey);
    const startTime = stored ? parseInt(stored, 10) : Date.now();
    
    if (!stored) {
      localStorage.setItem(startTimeKey, startTime.toString());
    }

    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [caseData.id, isTimerRunning]);

  // Attempts tracking
  useEffect(() => {
    const attemptsKey = `noirnote:attempts:${caseData.id}`;
    const stored = localStorage.getItem(attemptsKey);
    const initialAttempts = stored ? parseInt(stored, 10) : 0;
    setAttempts(initialAttempts);
  }, [caseData.id]);

  // Submit handler
  function onSubmitReport() {
    if (!allSelected || isSubmitting || isModalOpen) return;

    setIsSubmitting(true);

    // Validate solution
    const isCorrect =
      finalSuspect === caseData.solution.suspectId &&
      finalLocation === caseData.solution.locationId &&
      finalWeapon === caseData.solution.weaponId;

    // Increment attempts
    const newAttempts = attempts + 1;
    const attemptsKey = `noirnote:attempts:${caseData.id}`;
    localStorage.setItem(attemptsKey, newAttempts.toString());
    setAttempts(newAttempts);

    // Stop timer if correct
    if (isCorrect) {
      setIsTimerRunning(false);
    }

    // Save to Firestore (don't block on this - fire and forget)
    saveCaseResult(caseData.id, duration, newAttempts, isCorrect).catch((error) => {
      console.error("[CaseClient] Failed to save result:", error);
      // Continue even if save fails
    });

    // Show result modal immediately (non-blocking)
    setResultState({
      type: isCorrect ? "success" : "failure",
      duration,
      attempts: newAttempts,
    });

    // Reset submitting state after a short delay to ensure modal renders
    setTimeout(() => {
      setIsSubmitting(false);
    }, 100);
  }

  function closeResultModal() {
    setResultState(null);
    // If incorrect, allow retry (don't reset form)
    // If correct, form should remain disabled
  }

  function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes > 0) {
      return `${minutes}:${secs.toString().padStart(2, "0")}`;
    }
    return `${secs}sn`;
  }

  return (
    <>
      <div className={`space-y-8 ${isModalOpen ? "pointer-events-none opacity-50" : ""}`}>
        {/* Timer Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-2">
              <span className="text-xs text-zinc-400 mr-2">⏱️ Süre:</span>
              <span className="text-sm font-semibold text-white">{formatDuration(duration)}</span>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-2">
              <span className="text-xs text-zinc-400 mr-2">🎯 Denemeler:</span>
              <span className="text-sm font-semibold text-white">{attempts}</span>
            </div>
          </div>
        </div>

        {/* Two-column layout: Left (briefing + clues) | Right (grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Briefing + Clues */}
          <div className="space-y-6">
            {/* Briefing */}
            <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 shadow-lg shadow-black/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">📄</span>
                {textsTR.cases.briefing}
              </h2>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-5 text-sm text-zinc-300 leading-relaxed">
                {getText(caseData.briefingKey)}
              </div>
            </div>

            {/* Clues */}
            <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 shadow-lg shadow-black/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🔍</span>
                {textsTR.cases.clues}
              </h2>
              <ul className="space-y-3">
                {caseData.clues.map((clueKey, index) => (
                  <li
                    key={index}
                    className="group rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 text-sm text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-800 text-zinc-500 flex items-center justify-center text-xs font-bold mt-0.5 group-hover:bg-zinc-700 group-hover:text-white transition-colors">
                        {index + 1}
                      </span>
                      <span className="flex-1">{getText(clueKey)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Investigation Grid */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 shadow-lg shadow-black/20">
              <InvestigationGrid caseData={caseData} />
            </div>
          </div>
        </div>
      </div>

      {/* Final Deduction Section */}
      <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 shadow-lg shadow-black/20">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          {textsTR.grid.finalDeduction}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {/* Suspect Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
              <span className="text-lg">👤</span>
              {textsTR.grid.suspects}
            </label>
            <select
              value={finalSuspect}
              onChange={(e) => setFinalSuspect(e.target.value)}
              disabled={isModalOpen || isSubmitting}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-zinc-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">-- Seçiniz --</option>
              {caseData.suspects.map((suspect) => (
                <option key={suspect.id} value={suspect.id}>
                  {getText(suspect.nameKey)}
                </option>
              ))}
            </select>
          </div>

          {/* Location Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
              <span className="text-lg">📍</span>
              {textsTR.grid.locations}
            </label>
            <select
              value={finalLocation}
              onChange={(e) => setFinalLocation(e.target.value)}
              disabled={isModalOpen || isSubmitting}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-zinc-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">-- Seçiniz --</option>
              {caseData.locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {getText(location.nameKey)}
                </option>
              ))}
            </select>
          </div>

          {/* Weapon Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
              <span className="text-lg">🔪</span>
              {textsTR.grid.weapons}
            </label>
            <select
              value={finalWeapon}
              onChange={(e) => setFinalWeapon(e.target.value)}
              disabled={isModalOpen || isSubmitting}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-zinc-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">-- Seçiniz --</option>
              {caseData.weapons.map((weapon) => (
                <option key={weapon.id} value={weapon.id}>
                  {getText(weapon.nameKey)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={onSubmitReport}
          disabled={!allSelected || isSubmitting || isModalOpen}
          className={`w-full rounded-lg px-6 py-4 font-bold text-base transition-all duration-200 shadow-lg ${
            allSelected && !isSubmitting && !isModalOpen
              ? "bg-white text-black hover:bg-zinc-200 hover:shadow-xl hover:shadow-white/10 active:scale-[0.98]"
              : "bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-black/20"
          }`}
          title={!allSelected ? textsTR.grid.submitDisabledHint : ""}
        >
          {isSubmitting ? (
            textsTR.common.loading
          ) : allSelected ? (
            <span className="flex items-center justify-center gap-2">
              {textsTR.grid.submitReport}
              <span className="text-xl">✓</span>
            </span>
          ) : (
            textsTR.grid.submitReport
          )}
        </button>
      </div>

      {/* Result Modal */}
      {resultState && (
        <ResultModal
          type={resultState.type}
          duration={resultState.duration}
          attempts={resultState.attempts}
          caseId={caseData.id}
          onClose={closeResultModal}
        />
      )}
    </>
  );
}

