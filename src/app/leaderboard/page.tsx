import AuthGate from "@/components/AuthGate";
import { AuthedShell } from "@/components/AuthedShell";
import { textsTR } from "@/lib/texts.tr";
import LeaderboardClient from "./LeaderboardClient";

export default function LeaderboardPage() {
  return (
    <AuthGate>
      <AuthedShell title={textsTR.leaderboard.title}>
        <LeaderboardClient />
      </AuthedShell>
    </AuthGate>
  );
}
