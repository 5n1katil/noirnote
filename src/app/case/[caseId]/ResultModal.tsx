"use client";

/**
 * NoirNote — Case Result Modal
 *
 * Displays success/failure result after submitting case solution.
 */

import Link from "next/link";
import { textsTR } from "@/lib/texts.tr";
import { cases } from "@/lib/cases";

type ResultModalProps = {
  type: "success" | "failure";
  duration: number;
  attempts: number;
  caseId: string;
  onClose: () => void;
};

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes > 0) {
    return `${minutes}dk ${secs}sn`;
  }
  return `${secs}sn`;
}

export default function ResultModal({
  type,
  duration,
  attempts,
  caseId,
  onClose,
}: ResultModalProps) {
  // Find next case
  const currentIndex = cases.findIndex((c) => c.id === caseId);
  const nextCase = currentIndex >= 0 && currentIndex < cases.length - 1 
    ? cases[currentIndex + 1] 
    : null;

  const isSuccess = type === "success";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative mx-4 w-full max-w-md rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-4 sm:p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 sm:right-4 top-3 sm:top-4 text-zinc-400 hover:text-white transition-colors text-sm sm:text-base"
        >
          {textsTR.common.close}
        </button>

        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <div className={`text-4xl sm:text-6xl mb-3 sm:mb-4 ${isSuccess ? "animate-bounce" : ""}`}>
            {isSuccess ? "🎉" : "❌"}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {isSuccess ? textsTR.result.success.title : textsTR.result.failure.title}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            {isSuccess ? textsTR.result.success.message : textsTR.result.failure.message}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg bg-zinc-950/50 border border-zinc-800">
          <div className="text-center">
            <div className="text-xs text-zinc-500 mb-1">{textsTR.result.stats.duration}</div>
            <div className="text-base sm:text-lg font-semibold text-white">{formatDuration(duration)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-zinc-500 mb-1">{textsTR.result.stats.attempts}</div>
            <div className="text-base sm:text-lg font-semibold text-white">{attempts}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 sm:space-y-3">
          {isSuccess && nextCase ? (
            <Link
              href={`/case/${nextCase.id}`}
              className="block w-full rounded-lg bg-white text-black px-4 sm:px-6 py-2.5 sm:py-3 text-center text-sm sm:text-base font-semibold hover:bg-zinc-200 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-black/20"
            >
              {textsTR.result.actions.nextCase}
            </Link>
          ) : null}
          
          {!isSuccess ? (
            <button
              onClick={onClose}
              className="w-full rounded-lg bg-white text-black px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold hover:bg-zinc-200 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-black/20"
            >
              {textsTR.result.actions.retry}
            </button>
          ) : null}

          <Link
            href="/dashboard"
            className="block w-full rounded-lg border border-zinc-700 bg-zinc-800 text-white px-4 sm:px-6 py-2.5 sm:py-3 text-center text-sm sm:text-base font-semibold hover:bg-zinc-700 active:scale-[0.98] transition-all duration-200"
          >
            {textsTR.result.actions.dashboard}
          </Link>
        </div>
      </div>
    </div>
  );
}

