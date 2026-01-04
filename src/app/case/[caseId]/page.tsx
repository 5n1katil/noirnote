import { notFound } from "next/navigation";
import Link from "next/link";
import AuthGate from "@/components/AuthGate";
import { AuthedShell } from "@/components/AuthedShell";
import { textsTR } from "@/lib/texts.tr";
import { getCaseById } from "@/lib/cases";
import { getText } from "@/lib/text-resolver";

type CasePageProps = {
  params: Promise<{ caseId: string }>;
};

export default async function CasePage({ params }: CasePageProps) {
  const { caseId } = await params;
  const caseData = getCaseById(caseId);

  if (!caseData) {
    notFound();
  }

  return (
    <AuthGate>
      <AuthedShell title={getText(caseData.titleKey)}>
        <div className="space-y-6">
          {/* Vaka başlığı */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Link
                href="/dashboard"
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                ← {textsTR.common.back}
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-zinc-400">
                {textsTR.difficulty.label}
              </span>
              <span className="text-sm font-medium text-zinc-300">
                {textsTR.difficulty[caseData.difficulty]}
              </span>
            </div>
          </div>

          {/* İpuçları */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">
              {textsTR.cases.clues}
            </h2>
            <ul className="space-y-3">
              {caseData.clues.map((clueKey, index) => (
                <li
                  key={index}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-300"
                >
                  {getText(clueKey)}
                </li>
              ))}
            </ul>
          </div>

          {/* Placeholder: Oyun tahtası */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
            <p className="text-zinc-400">
              {textsTR.cases.boardPlaceholder}
            </p>
          </div>
        </div>
      </AuthedShell>
    </AuthGate>
  );
}

