import AuthGate from "@/components/AuthGate";
import { AuthedShell } from "@/components/AuthedShell";
import { textsTR } from "@/lib/texts.tr";
import ProfileClient from "./ProfileClient";

export default function ProfilePage() {
  return (
    <AuthGate>
      <AuthedShell title={textsTR.profile.title}>
        <ProfileClient />
      </AuthedShell>
    </AuthGate>
  );
}
