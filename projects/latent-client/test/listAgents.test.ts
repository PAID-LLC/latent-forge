import { describe, it, expect } from "vitest";
import { LatentClient, LatentError, RegistryEntry } from "../src/index";

function fakeFetch(status: number, body: unknown, seen: { url?: string; init?: RequestInit } = {}) {
  return (async (url: string, init?: RequestInit) => {
    seen.url = url; seen.init = init;
    return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  }) as unknown as typeof fetch;
}

describe("listAgents", () => {
  it("returns entries with correct structure", async () => {
    const seen: { url?: string } = {};
    const entries: RegistryEntry[] = [
      { agent_name: "agent1", model_class: "gpt-4", created_at: "2026-11-23T06:03:56.463577+00:00", has_pubkey: false },
    ];
    const c = new LatentClient({ fetch: fakeFetch(200, { entries, limit: 1, offset: 0 }, seen) });
    const result = await c.listAgents();
    expect(result.entries).toEqual(entries);
    expect(result.limit).toBe(1);
    expect(result.offset).toBe(0);
  });

  it("defaults limit to 50 and offset to 0", async () => {
    const seen: { url?: string } = {};
    const c = new LatentClient({ fetch: fakeFetch(200, { entries: [], limit: 50, offset: 0 }, seen) });
    await c.listAgents();
    expect(seen.url).toBe("https://paiddev.com/api/registry?limit=50");
  });

  it("clamps limit to 1..200", async () => {
    const seen1: { url?: string } = {};
    const c1 = new LatentClient({ fetch: fakeFetch(200, { entries: [], limit: 1, offset: 0 }, seen1) });
    await c1.listAgents({ limit: 0 });
    expect(seen1.url).toBe("https://paiddev.com/api/registry?limit=1");

    const seen2: { url?: string } = {};
    const c2 = new LatentClient({ fetch: fakeFetch(200, { entries: [], limit: 200, offset: 0 }, seen2) });
    await c2.listAgents({ limit: 500 });
    expect(seen2.url).toBe("https://paiddev.com/api/registry?limit=200");
  });

  it("handles NaN and Infinity by falling back to defaults", async () => {
    const seen1: { url?: string } = {};
    const c1 = new LatentClient({ fetch: fakeFetch(200, { entries: [], limit: 50, offset: 0 }, seen1) });
    await c1.listAgents({ limit: NaN });
    expect(seen1.url).toBe("https://paiddev.com/api/registry?limit=50");

    const seen2: { url?: string } = {};
    const c2 = new LatentClient({ fetch: fakeFetch(200, { entries: [], limit: 50, offset: 0 }, seen2) });
    await c2.listAgents({ limit: Infinity });
    expect(seen2.url).toBe("https://paiddev.com/api/registry?limit=50");

    const seen3: { url?: string } = {};
    const c3 = new LatentClient({ fetch: fakeFetch(200, { entries: [], limit: 50, offset: 0 }, seen3) });
    await c3.listAgents({ offset: NaN });
    expect(seen3.url).toBe("https://paiddev.com/api/registry?limit=50");

    const seen4: { url?: string } = {};
    const c4 = new LatentClient({ fetch: fakeFetch(200, { entries: [], limit: 50, offset: 0 }, seen4) });
    await c4.listAgents({ offset: Infinity });
    expect(seen4.url).toBe("https://paiddev.com/api/registry?limit=50");
  });

  it("floors fractional values", async () => {
    const seen1: { url?: string } = {};
    const c1 = new LatentClient({ fetch: fakeFetch(200, { entries: [], limit: 10, offset: 0 }, seen1) });
    await c1.listAgents({ limit: 10.9 });
    expect(seen1.url).toBe("https://paiddev.com/api/registry?limit=10");

    const seen2: { url?: string } = {};
    const c2 = new LatentClient({ fetch: fakeFetch(200, { entries: [], limit: 50, offset: 5 }, seen2) });
    await c2.listAgents({ offset: 5.9 });
    expect(seen2.url).toBe("https://paiddev.com/api/registry?limit=50&offset=5");
  });

  it("sends offset only when above 0", async () => {
    const seen1: { url?: string } = {};
    const c1 = new LatentClient({ fetch: fakeFetch(200, { entries: [], limit: 50, offset: 0 }, seen1) });
    await c1.listAgents({ offset: 0 });
    expect(seen1.url).toBe("https://paiddev.com/api/registry?limit=50");

    const seen2: { url?: string } = {};
    const c2 = new LatentClient({ fetch: fakeFetch(200, { entries: [], limit: 50, offset: 10 }, seen2) });
    await c2.listAgents({ offset: 10 });
    expect(seen2.url).toBe("https://paiddev.com/api/registry?limit=50&offset=10");
  });

  it("handles negative offset by defaulting to 0", async () => {
    const seen: { url?: string } = {};
    const c = new LatentClient({ fetch: fakeFetch(200, { entries: [], limit: 50, offset: 0 }, seen) });
    await c.listAgents({ offset: -5 });
    expect(seen.url).toBe("https://paiddev.com/api/registry?limit=50");
  });

  it("throws LatentError on failure", async () => {
    const c = new LatentClient({ fetch: fakeFetch(500, { error: "Internal server error" }) });
    await expect(c.listAgents()).rejects.toMatchObject({ status: 500, message: "Internal server error" });
    await expect(c.listAgents()).rejects.toBeInstanceOf(LatentError);
  });

  it("respects a custom baseUrl", async () => {
    const seen: { url?: string } = {};
    const c = new LatentClient({ baseUrl: "http://localhost:3000", fetch: fakeFetch(200, { entries: [], limit: 50, offset: 0 }, seen) });
    await c.listAgents();
    expect(seen.url).toBe("http://localhost:3000/api/registry?limit=50");
  });
});
