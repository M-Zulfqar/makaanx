type SignOutClient = {
  auth: { signOut: (options: { scope: "local" }) => Promise<{ error: unknown }> };
};

// Navigate only after Supabase has removed this browser's session and cookies.
export async function signOutAndRedirect(client: SignOutClient, navigate: () => void) {
  const { error } = await client.auth.signOut({ scope: "local" });
  if (error) throw error;
  navigate();
}
