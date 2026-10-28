"use client";

import { useState } from "react";

export function SignOutButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Logout request failed");
      window.location.replace("/login");
    } catch {
      setError("We couldn’t end your session. Please try again.");
      setPending(false);
    }
  }

  return (
    <div className="signout-control">
      <button className="dashboard-signout" type="button" onClick={signOut} disabled={pending}>
        {pending ? "Signing out…" : "Sign out"}
      </button>
      {error && <span className="signout-error" role="alert">{error}</span>}
    </div>
  );
}
