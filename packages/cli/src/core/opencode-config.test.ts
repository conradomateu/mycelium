import { describe, expect, it } from "vitest";
import { normalizeOpenCodeConfig } from "./opencode-config.js";

describe("OpenCode V2 MCP configuration", () => {
  it("migrates legacy servers without changing unrelated settings or runtime secrets", () => {
    const input = {
      model: "keep",
      mcp: {
        timeout: { execution: 90000 },
        context7: {
          type: "local", command: ["npx", "context7"], enabled: false,
          environment: { CONTEXT7_API_KEY: "${CONTEXT7_API_KEY}" },
          timeout: { startup: 45000 },
        },
        servers: { native: { type: "remote", url: "https://example.com/mcp", oauth: false } },
      },
    };
    const original = structuredClone(input);
    const output = normalizeOpenCodeConfig(input);
    expect(output).toEqual({
      model: "keep",
      mcp: {
        timeout: { execution: 90000 },
        servers: {
          context7: {
            type: "local", command: ["npx", "context7"], disabled: true,
            environment: { CONTEXT7_API_KEY: "{env:CONTEXT7_API_KEY}" },
            timeout: { startup: 45000 },
          },
          native: { type: "remote", url: "https://example.com/mcp", oauth: false },
        },
      },
    });
    expect(input).toEqual(original);
    expect(normalizeOpenCodeConfig(output)).toEqual(output);
  });

  it("keeps V2 entries authoritative and does not treat MCP settings as servers", () => {
    expect(normalizeOpenCodeConfig({ mcp: {
      timeout: { startup: 1 },
      context7: { type: "local", command: ["old"], enabled: false },
      servers: { context7: { type: "local", command: ["new"], disabled: false } },
    } })).toEqual({ mcp: {
      timeout: { startup: 1 },
      servers: { context7: { type: "local", command: ["new"], disabled: false } },
    } });
  });

  it("rejects malformed server containers rather than overwriting them", () => {
    for (const mcp of [[], "bad", { servers: [] }, { servers: "bad" }]) {
      expect(() => normalizeOpenCodeConfig({ mcp })).toThrow("Invalid OpenCode");
    }
  });

  it("preserves server names that coincide with Object.prototype properties", () => {
    const config = JSON.parse('{"mcp":{"__proto__":{"type":"local","command":["keep"]},"servers":{"constructor":{"type":"remote","url":"https://example.com/mcp"}}}}');
    const output = JSON.parse(JSON.stringify(normalizeOpenCodeConfig(config)));
    expect(Object.hasOwn(output.mcp.servers, "__proto__")).toBe(true);
    expect(output.mcp.servers.__proto__.command).toEqual(["keep"]);
    expect(output.mcp.servers.constructor.url).toBe("https://example.com/mcp");
  });
});
