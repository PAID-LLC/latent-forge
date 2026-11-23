// node --test forge/run.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { allowedPath, projectOf, testNames } from "./run.mjs";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

test("finds the project in a spec", () => {
  assert.equal(projectOf("## Project\nprojects/latent-client\n\n## What"), "projects/latent-client");
  assert.equal(projectOf("## Project\n`projects/latent-client`"), "projects/latent-client");
  assert.equal(projectOf("## Project\n../etc"), null);
  assert.equal(projectOf("no section"), null);
});

test("writes only inside the project, never protected files", () => {
  const p = "projects/latent-client";
  assert.equal(allowedPath("projects/latent-client/src/registry.ts", p), true);
  assert.equal(allowedPath("projects/latent-client/test/registry.test.ts", p), true);
  for (const bad of [
    "projects/latent-client/package.json", "projects/latent-client/../../forge/run.mjs",
    ".github/workflows/forge.yml", "forge/run.mjs", "projects/other/src/x.ts",
    "/etc/passwd", "projects/latent-client/node_modules/x.js", "projects/latent-client/.git/hooks/pre-commit",
    "projects/latent-client\\..\\x", "",
  ]) assert.equal(allowedPath(bad, p), false, bad);
});

test("collects test names so a removed test is noticed", () => {
  const dir = mkdtempSync(join(tmpdir(), "forge-t-"));
  mkdirSync(join(dir, "test"));
  writeFileSync(join(dir, "test", "a.test.ts"), `it("returns the rooms array", () => {});\ntest('throws on failure', () => {});`);
  writeFileSync(join(dir, "test", "helper.ts"), `it("not a test file", () => {});`);
  const names = [...testNames(dir)].map((n) => n.split("::")[1]).sort();
  assert.deepEqual(names, ["returns the rooms array", "throws on failure"]);
});
