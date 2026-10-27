/** Normalize legacy MCP entries to OpenCode V2 without resolving credentials. */
export function normalizeOpenCodeConfig(config: Record<string, unknown>): Record<string, unknown> {
  if (config.mcp === undefined) return config;
  const isObject = (value: unknown): value is Record<string, unknown> =>
    value !== null && typeof value === "object" && !Array.isArray(value);
  if (!isObject(config.mcp)) throw new Error("Invalid OpenCode mcp: expected an object");
  const mcp = { ...config.mcp };
  if (mcp.servers !== undefined && !isObject(mcp.servers)) {
    throw new Error("Invalid OpenCode mcp.servers: expected an object");
  }
  const servers: Record<string, unknown> = {};
  for (const [name, entry] of Object.entries(mcp)) {
    if (name === "servers" || !isObject(entry)) continue;
    if (!["local", "remote"].includes(String(entry.type)) && !Array.isArray(entry.command)) continue;
    servers[name] = Array.isArray(entry.command) && !entry.type ? { ...entry, type: "local" } : entry;
    delete mcp[name];
  }
  Object.assign(servers, mcp.servers);
  for (const [name, entry] of Object.entries(servers)) {
    if (!isObject(entry)) throw new Error("Invalid OpenCode server: expected an object");
    const normalized = { ...entry };
    if (typeof normalized.enabled === "boolean") {
      normalized.disabled ??= !normalized.enabled;
      delete normalized.enabled;
    }
    if (isObject(normalized.environment)) {
      normalized.environment = Object.fromEntries(Object.entries(normalized.environment).map(([key, value]) => [
        key, typeof value === "string"
          ? value.replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g, "{env:$1}") : value,
      ]));
    }
    servers[name] = normalized;
  }
  return { ...config, mcp: { ...mcp, servers } };
}
