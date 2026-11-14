// Intentionally has no RPC, document access or configurable enable flag.
// Replace only after the reconciled v1 review/storage authorization tests pass.
export function IdentityReviewForm() {
  return <p className="mt-4 rounded border p-3 text-sm">Approval, rejection and private document access are disabled pending authorized staging validation. No review has been recorded.</p>;
}
