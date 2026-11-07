import type { ToolDescriptor } from "./_types.js";

/**
 * Kimi Code CLI (kimi-code).
 *
 * - Data dir resolves to $KIMI_CODE_HOME first, then ~/.kimi-code.
 *   Mycelium targets the default ~/.kimi-code location.
 * - MCP: mcp.json with an `mcpServers` map, standard entry shape
 *   (command/args/env for stdio, url for HTTP). Project level overrides
 *   user level on name collision.
 * - Skills: directory bundles `<name>/SKILL.md` under skills dirs.
 * - Agents: Markdown profiles discovered from agents dirs.
 * - The CLI has no `mcp add` subcommand; MCP config is file-based only
 *   (or `/mcp-config` interactively in the TUI).
 */
export const kimi: ToolDescriptor = {
  id: "kimi",
  display: { name: "Kimi Code", icon: "kimi", color: "#4D6BFE" },
  cli: { command: "kimi" },
  detectPath: null,
  paths: {
    mcp: "~/.kimi-code/mcp.json",
    projectMcp: ".kimi-code/mcp.json",
    skills: "~/.kimi-code/skills",
    projectSkills: ".kimi-code/skills/",
    agents: "~/.kimi-code/agents/",
    projectAgents: ".kimi-code/agents/",
    rules: null,
    hooks: null,
    commands: null,
    backupDirs: ["~/.kimi-code"],
  },
  mcp: { format: "json", key: "mcpServers", entryShape: "standard" },
  capabilities: ["mcp", "skills", "agents"],
  enabled: true,
};
