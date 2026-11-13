import type { SupabaseClient } from "@supabase/supabase-js";

type DiagnosticClient = Pick<SupabaseClient, "auth" | "rpc" | "from">;
export type AccessReport = {
  projectReference: string | null;
  authenticatedRole: "authenticated" | "anon" | "unexpected" | null;
  adminRpcResult: boolean | null;
  accessibleProfileCount: number | null;
  errorCodes: Partial<Record<"configuration" | "auth" | "claims" | "adminRpc" | "profiles", string>>;
};

export function projectReference(url: string | undefined): string | null {
  try {
    const parsed = new URL(url ?? "");
    return parsed.protocol === "https:"
      ? /^([a-z0-9]{20})\.supabase\.co$/.exec(parsed.hostname)?.[1] ?? null : null;
  } catch { return null; }
}

// Only machine codes are released. Never serialize SDK errors, users, claims,
// JWTs, profile rows, cookie values, document references or exception messages.
function errorCode(error: unknown): string {
  if (error && typeof error === "object" && "code" in error &&
      typeof error.code === "string" && /^[A-Za-z0-9_]{1,40}$/.test(error.code)) return error.code;
  return "REQUEST_FAILED";
}

export function emptyAccessReport(url: string | undefined): AccessReport {
  const reference = projectReference(url);
  return {
    projectReference: reference, authenticatedRole: null, adminRpcResult: null,
    accessibleProfileCount: null,
    errorCodes: reference ? {} : { configuration: "PROJECT_REFERENCE_UNAVAILABLE" },
  };
}

export async function collectAccessReport(client: DiagnosticClient, url: string | undefined) {
  const report = emptyAccessReport(url);
  let authenticated = false;
  try {
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) {
      report.errorCodes.auth = error ? errorCode(error) : "AUTH_REQUIRED";
      return { report, authenticated };
    }
    authenticated = true;
  } catch (error) {
    report.errorCodes.auth = errorCode(error);
    return { report, authenticated };
  }

  // getClaims verifies the session JWT; do not decode and trust an arbitrary token.
  try {
    const { data, error } = await client.auth.getClaims();
    if (error || !data?.claims) {
      report.errorCodes.claims = error ? errorCode(error) : "CLAIMS_UNAVAILABLE";
      return { report, authenticated };
    }
    const role = data.claims.role;
    report.authenticatedRole = role === "authenticated" || role === "anon" ? role : "unexpected";
    if (role !== "authenticated") {
      report.errorCodes.claims = "UNEXPECTED_JWT_ROLE";
      return { report, authenticated };
    }
    const issuerReference = projectReference(data.claims.iss);
    if (report.projectReference && issuerReference !== report.projectReference) {
      report.errorCodes.claims = "JWT_PROJECT_MISMATCH";
      return { report, authenticated };
    }
  } catch (error) {
    report.errorCodes.claims = errorCode(error);
    return { report, authenticated };
  }

  await Promise.all([
    (async () => {
      try {
        const { data, error } = await client.rpc("makaanx_is_admin");
        if (error) report.errorCodes.adminRpc = errorCode(error);
        else if (typeof data === "boolean") report.adminRpcResult = data;
        else report.errorCodes.adminRpc = "UNEXPECTED_RPC_RESULT";
      } catch (error) { report.errorCodes.adminRpc = errorCode(error); }
    })(),
    (async () => {
      try {
        const { count, error } = await client.from("profiles").select("id", { count: "exact", head: true });
        if (error) report.errorCodes.profiles = errorCode(error);
        else if (typeof count === "number" && Number.isSafeInteger(count) && count >= 0) report.accessibleProfileCount = count;
        else report.errorCodes.profiles = "COUNT_UNAVAILABLE";
      } catch (error) { report.errorCodes.profiles = errorCode(error); }
    })(),
  ]);
  return { report, authenticated };
}
