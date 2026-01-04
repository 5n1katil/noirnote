import Link from "next/link";
import AuthGate from "@/components/AuthGate";
import { AuthedShell } from "@/components/AuthedShell";
import { textsTR } from "@/lib/texts.tr";
import { cases } from "@/lib/cases";
import { getText } from "@/lib/text-resolver";

export default function DashboardPage() {
  return (
    <AuthGate>
      <AuthedShell title={textsTR.dashboard.title}>
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              {textsTR.cases.list.title}
            </h2>
            <div className="grid gap-4">
              {cases.map((caseItem) => (
                <div
                  key={caseItem.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {getText(caseItem.titleKey)}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-zinc-400">
                          {textsTR.difficulty.label}
                        </span>
                        <span className="text-sm font-medium text-zinc-300">
                          {textsTR.difficulty[caseItem.difficulty]}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/case/${caseItem.id}`}
                      className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200 transition-colors"
                    >
                      {textsTR.cases.list.startButton}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AuthedShell>
    </AuthGate>
  );
}
