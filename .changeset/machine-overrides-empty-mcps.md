---
"@mycelish/cli": patch
---

Stop syncing `hostname`, `detectedAt`, `updatedAt` and `mcps` as MCP servers. When a rescan found no command overrides, the machine overrides file was written with an empty `mcps:` (YAML null), and the machine config loader then read the whole file as flat MCP servers: Codex got `command = "undefined"` entries (0.3.9: `sync` crashed in the TOML encoder) and `claude mcp add-json` failed, on every other sync. The file now writes `mcps: {}`, and a file with a `mcps` key is always read as the nested format.
