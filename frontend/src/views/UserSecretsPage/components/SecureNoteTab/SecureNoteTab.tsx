import { AnimationWrapper } from "../AnimationWrapper/AnimationWrapper";
import { SecureNoteSection } from "./components/SecureNoteSection/SecureNoteSection";

export const SecureNoteTab = () => {
  return (
    <AnimationWrapper key="panel-org-user-secrets-secure-note">
      <SecureNoteSection />
    </AnimationWrapper>
  );
};
