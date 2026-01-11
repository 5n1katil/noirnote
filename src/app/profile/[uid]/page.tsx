import AuthGate from "@/components/AuthGate";
import { AuthedShell } from "@/components/AuthedShell";
import { textsTR } from "@/lib/texts.tr";
import PublicProfileClient from "./PublicProfileClient";

type PublicProfilePageProps = {
  params: Promise<{ uid: string }>;
};

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { uid } = await params;

  return (
    <AuthGate>
      <AuthedShell title={textsTR.profile.title}>
        <PublicProfileClient targetUid={uid} />
      </AuthedShell>
    </AuthGate>
  );
}
