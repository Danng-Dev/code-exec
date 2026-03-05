import { assertEquals } from "@std/assert";
import { evaluateSnippet, checkApiKey } from "./main.ts";

Deno.test("checkApiKey rejects unauthorized request", () => {
  const fakeReq = { headers: { apikey: "wrong" } } as any;
  const fakeRes = {
    status: (_: number) => fakeRes,
    json: (_: any) => fakeRes,
  } as any;
  const result = checkApiKey(fakeReq, fakeRes);
  assertEquals(result, false);
});

if (Deno.env.get("DENO_DEPLOY_TOKEN")) {
  Deno.test("evaluateSnippet should compute simple expression", async () => {
    const result = await evaluateSnippet("1 + 2;");
    assertEquals(result, 3);
  });
} else {
  console.warn("Skipping sandbox tests: DENO_DEPLOY_TOKEN not set");
}
