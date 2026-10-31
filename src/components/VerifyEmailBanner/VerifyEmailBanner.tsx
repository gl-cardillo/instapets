import "./VerifyEmailBanner.css";
import { useState } from "react";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useAuth } from "../../auth/AuthContext";
import { handleError, handleSuccess, reportError } from "../../utils/alerts";
import { Button } from "../ui/Button";

// asks signed-in users with an unverified email to verify it
export function VerifyEmailBanner() {
  const { refreshEmailVerified } = useAuth();
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    try {
      await action();
    } catch (error) {
      reportError(error);
    } finally {
      setBusy(false);
    }
  };

  const resend = () =>
    run(async () => {
      if (!auth.currentUser) return;
      await sendEmailVerification(auth.currentUser);
      handleSuccess("Verification email sent");
    });

  const check = () =>
    run(async () => {
      if (await refreshEmailVerified()) handleSuccess("Email verified");
      else handleError("Not verified yet. Click the link in the email first.");
    });

  return (
    <div className="verify-email-banner">
      <p>
        Verify your email to post, like, comment and follow. Check your inbox
        (and spam) for the link.
      </p>
      <div>
        <Button variant="secondary" size="sm" onClick={resend} disabled={busy}>
          Resend email
        </Button>
        <Button size="sm" onClick={check} disabled={busy}>
          I've verified
        </Button>
      </div>
    </div>
  );
}
