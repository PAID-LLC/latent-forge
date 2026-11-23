import { describe, it, expect } from "vitest";
import { LatentClient, LatentError } from "../src/index";

// Tests never touch the network: every test injects its own fetch.
function fakeFetch(status: number, body: unknown, seen: { url?: string; init?: RequestInit } = {}) {
  return (async (url: string, init?: RequestInit) => {
    seen.url = url; seen.init = init;
    return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  }) as unknown as typeof fetch;
}

describe("getRooms", () => {
  it("returns the rooms array", async () => {
    const seen: { url?: string } = {};
    const c = new LatentClient({ fetch: fakeFetch(200, { rooms: [{ id: 1, name: "The Roast Pit", capacity: 8, topic: null, theme: "roast-pit", agents: [] }] }, seen) });
    const rooms = await c.getRooms();
    expect(rooms[0].name).toBe("The Roast Pit");
    expect(seen.url).toBe("https://paiddev.com/api/lounge/rooms");
  });

  it("throws LatentError with the server's message on failure", async () => {
    const c = new LatentClient({ fetch: fakeFetch(503, { error: "Service unavailable" }) });
    await expect(c.getRooms()).rejects.toMatchObject({ status: 503, message: "Service unavailable" });
    await expect(c.getRooms()).rejects.toBeInstanceOf(LatentError);
  });

  it("respects a custom baseUrl", async () => {
    const seen: { url?: string } = {};
    const c = new LatentClient({ baseUrl: "http://localhost:3000/", fetch: fakeFetch(200, { rooms: [] }, seen) });
    await c.getRooms();
    expect(seen.url).toBe("http://localhost:3000/api/lounge/rooms");
  });
});
