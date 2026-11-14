import { expect, test } from "vitest";
import { readProfileProjection, readProfileCounts } from "@/lib/admin/profiles";
import { rentalClient, projectionRow, profileCountsReply } from "./helpers/rental-client";

test("directory strips unexpected private fields and uses only the RPC", async () => {
  const f=rentalClient([{data:[{...projectionRow(),phone:"PRIVATE",cnic_path:"PRIVATE",verification_score:99}]}]);
  const rows=await readProfileProjection(f.client);
  expect(Object.keys(rows[0]).sort()).toEqual(["id","full_name","role","verification_status","has_document"].sort());
  expect(JSON.stringify(rows)).not.toContain("PRIVATE"); expect(f.calls.map(c=>c.table)).toEqual(["rpc:makaanx_admin_profiles"]);
});
test("missing directory RPC fails closed without a direct profiles fallback", async () => {
  const f=rentalClient([{data:null,error:{code:"PGRST202",message:"PRIVATE"}}]);
  await expect(readProfileProjection(f.client)).rejects.toThrow("ADMIN_PROFILES_UNAVAILABLE");expect(f.calls).toHaveLength(1);
});
test.each([null,[{...projectionRow(),has_document:"PRIVATE"}],Array.from({length:101},()=>projectionRow())])("malformed or over-limit directory responses are unavailable",async data=>{
  await expect(readProfileProjection(rentalClient([{data}]).client)).rejects.toThrow("ADMIN_PROFILES_UNAVAILABLE");
});
test("empty page retains independent exact count", async () => {
  const f=rentalClient([{data:[]},profileCountsReply(99)]);
  expect(await readProfileProjection(f.client,{},12,120)).toEqual([]);
  expect((await readProfileCounts(f.client)).total).toBe(99);
});
test.each([null,[],[{total:Number.MAX_SAFE_INTEGER+1}], [{total:-1}]])("invalid aggregate results cannot become zero",async data=>{
  await expect(readProfileCounts(rentalClient([{data}]).client)).rejects.toThrow("ADMIN_PROFILE_COUNTS_UNAVAILABLE");
});
