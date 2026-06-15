import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { StoryWizard } from "@/components/StoryWizard";

export default function WritePage() {
  return (
    <AppShell hideChrome>
      <AuthGate reason="사연 등록">
        <StoryWizard />
      </AuthGate>
    </AppShell>
  );
}
