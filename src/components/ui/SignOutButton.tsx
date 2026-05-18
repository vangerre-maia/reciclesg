"use client";

export function SignOutButton() {
  async function handleSignOut() {
    const csrf = await fetch("/api/auth/csrf").then((r) => r.json());
    await fetch("/api/auth/signout", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `csrfToken=${csrf.csrfToken}&callbackUrl=/login`,
    });
    window.location.href = "/login";
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition"
    >
      Sair
    </button>
  );
}
