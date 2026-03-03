# AI CLI Tools Guide

This document provides usage guides for both the **GitHub Copilot CLI** and the **Gemini CLI**. Both tools bring powerful AI capabilities to your terminal, but they have different strengths, flags, and execution models.

---

## 1. GitHub Copilot CLI

The GitHub Copilot CLI brings the Copilot AI agent directly into your terminal. It allows you to interact with your local codebase, run commands, and query GitHub context (like issues and PRs) using natural language.

> **Version tested:** `v0.0.418` (GA release, Feb 25 2026)

### What it CAN do
- **Explain Code & Workspaces:** Ask it to summarize directories, explain complex files, or find where specific logic lives.
- **Generate & Run Commands:** Ask it how to do something in the terminal (e.g., complex `git`, `ffmpeg`, or `docker` commands), and it will generate the command and let you run it.
- **Write & Refactor Code:** It can generate scripts, scaffold projects, or refactor existing files.
- **GitHub Integration:** It understands your GitHub context. You can ask it about issues, PRs, or repository details.
- **Fully Autonomous Mode:** With `--yolo --no-ask-user --autopilot`, it runs end-to-end without any confirmation prompts.
- **MCP Tool Integration:** Loads custom MCP servers from `~/.copilot/mcp-config.json`, giving it access to arbitrary external tools.

### What it CAN'T do
- **Inline Autocomplete:** It does not provide "as-you-type" ghost text in your terminal or editor (that is what the VS Code Copilot extension does).
- **Execute Without Permission (by default):** Without `--yolo`/`--allow-all-tools`, it will ask for confirmation before running commands or modifying files.
- **Read Unsaved Editor Changes:** It reads files from your disk, so make sure your changes are saved before asking it to analyze them.
- **Expand `${workspaceFolder}` in `.vscode/mcp.json`:** The CLI reads `.vscode/mcp.json` but does not substitute VS Code variables — use absolute paths in `~/.copilot/mcp-config.json` instead.

### MCP Configuration

MCP servers are loaded from two places at startup (merged by server name):

| Source | Path | Notes |
|--------|------|-------|
| User-level | `~/.copilot/mcp-config.json` | Loaded for every session, any directory |
| Repo-level | `.github/mcp.json` | Loaded when running in that repo *(variables not expanded)* |
| Workspace | `.vscode/mcp.json` | Also read, but `${workspaceFolder}` is **not** expanded — avoid stdio entries here |

**`~/.copilot/mcp-config.json` example (use absolute paths):**
```json
{
  "mcpServers": {
    "amosops-cli": {
      "type": "stdio",
      "command": "node",
      "args": ["E:/DEV/AmosOps-Remote/mcp-server.mjs"],
      "env": {
        "GATEWAY_URL": "http://100.64.54.100:8090",
        "PYTHON_URL": "http://100.81.239.75:8000"
      }
    }
  }
}
```

> **Important:** If `.vscode/mcp.json` has a server named `amosops-gateway` and your user config also uses that name, the broken workspace entry wins. Use a **different name** in your user config (e.g. `amosops-cli`) to avoid the collision.

You can also pass MCP config inline for a single session:
```bash
copilot --additional-mcp-config @.github/mcp.json -p "prompt"
```

### Autonomous Agent Invocation (for scripting / watch_comms.py)

The canonical command for running beast-copilot as a non-interactive autonomous agent:

```bash
copilot --yolo --no-ask-user --autopilot -s -p "your prompt here"
```

| Flag | Effect |
|------|--------|
| `--yolo` | Allow all tools, paths, and URLs without confirmation |
| `--no-ask-user` | Disable the `ask_user` tool — never pauses for input |
| `--autopilot` | Enable continuation in prompt mode (keeps going until done) |
| `-s` / `--silent` | Output only the agent response (no stats/spinner), clean for scripting |
| `-p` / `--prompt` | Non-interactive mode, exits after task completion |

Other useful flags:
- `--model <name>` — Override the model (e.g. `claude-sonnet-4.6`, `gpt-4.1`)
- `--experimental` — Enable experimental features
- `--continue` / `--resume` — Resume the most recent or a specific session
- `--disable-builtin-mcps` — Disable the built-in GitHub MCP server to reduce noise
- `--max-autopilot-continues <n>` — Cap the number of continuation steps

### Common Tasks & Use Cases

#### 1. Interactive Chat Session
The best way to use it is to start an interactive session in your project folder:
```bash
copilot
```
Once inside, you can just type your questions naturally.

#### 2. Quick Non-Interactive Task
```bash
copilot --yolo --no-ask-user --autopilot -s -p "Summarize all open tickets in the AmosOps gateway"
```

#### 3. Code Explanation
Navigate to a folder and ask it to explain things:
```bash
copilot -p "Explain what the ws-server.js file does in this project"
```

#### 4. Refactoring and Scripting
```bash
copilot --yolo --no-ask-user -p "Write a PowerShell script in the scripts/ folder that cleans up all .log files older than 30 days"
```

### Useful Slash Commands (Inside Interactive Mode)
When you run `copilot` to enter the interactive shell, you can use these slash commands:
- `/help` - Show available commands and usage.
- `/login` - Authenticate with your GitHub account.
- `/model` - Switch the underlying AI model (e.g., Claude Sonnet, GPT-4.1).
- `/mcp` - Manage MCP server configuration interactively.
- `/mcp list` - List all active MCP servers and their tools.
- `/experimental` - Enable experimental features.
- `/clear` - Clear the current conversation context.
- `/lsp` - Check the status of Language Server Protocol integrations.

### Pro Tips
- **MCP loads from `~/.copilot/mcp-config.json` automatically** — no extra flags needed once it's set up.
- **Context is Key:** Run the CLI from the root of your workspace so it has access to all your files.
- **Model Selection:** The CLI supports multiple models including Claude and GPT variants — use `--model` to pick the best one for the task.

---

## 2. Gemini CLI

The Gemini CLI is a powerful, agentic command-line tool that brings Google's Gemini models directly into your terminal. Unlike simple chat interfaces, this CLI is designed to act as an autonomous agent that can use tools, manage extensions, and interact with your local environment.

> **Version tested:** `0.30.0` (GA, Feb 2026) — fully verified with AmosOps MCP ✅

### What it CAN do
- **Interactive Agent Sessions:** Start an interactive chat where the agent can read files, run commands, and help you code.
- **Headless/Scripting Mode:** Run single prompts non-interactively, making it great for CI/CD pipelines or shell scripts.
- **Tool Execution:** It can run terminal commands and edit files (with your permission, or automatically in YOLO mode).
- **MCP Tool Integration:** Loads custom MCP servers from `~/.gemini/settings.json`, giving it access to arbitrary external tools.
- **Session Resumption:** You can pause your work and resume previous agent sessions later.

### What it CAN'T do
- **Inline Autocomplete:** Like Copilot CLI, it does not provide real-time typing suggestions in your terminal.
- **Read Unsaved Editor Changes:** It only sees the files as they are saved on your disk.
- **Bypass Sandbox (When Enabled):** If run with the `--sandbox` flag, it cannot modify files outside the allowed directories.

### Authentication (Required — v0.30.0+)

As of v0.30.0, `selectedAuthType` is **required** in `~/.gemini/settings.json`, or auth env vars must be set.

**First-time / re-authentication:** Run `gemini` interactively once — it will open a browser OAuth flow and write the token to its credential store automatically. This must be completed before headless mode works.

Supported auth methods:

| Method | Config |
|--------|--------|
| Google OAuth (personal) | `"selectedAuthType": "oauth-personal"` in settings.json, complete browser flow once |
| API Key | Set `GEMINI_API_KEY` environment variable |
| Vertex AI | Set `GOOGLE_GENAI_USE_VERTEXAI=true` + configure ADC |
| Google Cloud ADC | Set `GOOGLE_GENAI_USE_GCA=true` |

> **Important:** If you reinstall or update the CLI and auth breaks, run `gemini` interactively in the project directory and log in again. The `selectedAuthType` in settings.json tells the CLI which method to use; the token itself is stored in a platform credential store.

> **Pitfall:** Writing `~/.gemini/settings.json` with PowerShell `ConvertTo-Json` / `Set-Content` adds UTF-16 BOM or unusual encoding. **Always write it with Python** (`json.dumps` + `open(..., 'w', encoding='utf-8', newline='\n')`) or a JSON-aware editor.

### MCP Configuration

MCP servers are configured in `~/.gemini/settings.json` under `mcpServers`:

```json
{
  "selectedAuthType": "oauth-personal",
  "mcpServers": {
    "amosops-gateway": {
      "command": "node",
      "args": ["E:/DEV/AmosOps-Remote/mcp-server.mjs"],
      "env": {
        "GATEWAY_URL": "http://100.64.54.100:8090",
        "PYTHON_URL": "http://100.81.239.75:8000"
      }
    }
  }
}
```

> Use **forward slashes** or escaped backslashes in the `args` path on Windows. Use absolute paths (no `${workspaceFolder}` — Gemini doesn't expand that variable).

Once auth is configured, MCP tools load automatically on every `gemini` invocation.

### Autonomous Agent Invocation (for scripting / watch_comms.py)

The canonical command for running beast-gemini as a non-interactive autonomous agent:

```bash
gemini -y -p "your prompt here"
```

| Flag | Effect |
|------|--------|
| `-y` / `--yolo` | Auto-approve all tool calls — no confirmation prompts |
| `-p` / `--prompt` | Non-interactive mode, exits after task completion |
| `--approval-mode auto_edit` | Auto-approve file edits only, still prompt for shell commands |
| `--approval-mode plan` | Read-only mode — analyzes but never modifies |

Other useful flags:
- `-m <model>` / `--model <model>` — Override the model (e.g. `gemini-2.5-pro`)
- `--include-directories <path>` — Add extra directories to the workspace
- `-r latest` / `-r <n>` — Resume the most recent or Nth session
- `--list-sessions` — Show available sessions for the current project
- `-o json` / `-o stream-json` — Machine-readable output for scripting

### Model Selection (Gemini CLI)

Gemini CLI supports multiple ways to set the model:

1. Command-line flag: `--model <model>` or `-m <model>`
2. Interactive command: `/model` inside an interactive session
3. Environment variable: `GEMINI_MODEL=<model>`
4. Config file: `model.name` in `~/.gemini/settings.json`

Model IDs reported as available in your environment:

- `auto-gemini-3`
- `auto-gemini-2.5`
- `gemini-3-pro-preview`
- `gemini-3-flash-preview`
- `gemini-2.5-pro`
- `gemini-2.5-flash`
- `gemini-2.5-flash-lite`
- `gemini-1.5-pro-latest`

> Note: preview models may require Preview Features enabled in your Gemini account.

### Common Tasks & Use Cases

#### 1. Interactive Chat Session
The most common way to use the CLI is to just launch it in your project directory:
```bash
gemini
```
You can also start it with an initial prompt:
```bash
gemini -i "Help me refactor the WebSocket server in ws-server.js"
```

#### 2. Quick Headless Task
If you just want the agent to do one thing and exit (useful for scripting):
```bash
gemini -y -p "Write a Python script that pings localhost:8080 every 5 seconds and logs the result"
```

Equivalent non-interactive form (explicit approval mode + debug logging):
```bash
gemini "Write a Python script that pings localhost:8080 every 5 seconds and logs the result" --model gemini-2.5-pro --approval-mode yolo --debug > output.log 2>&1
```

#### 3. Code Explanation (via Piping)
You can pipe output from other commands directly into Gemini in headless mode:
```bash
cat error.log | gemini -y -p "Explain this error and suggest a fix"
```

#### 4. Refactoring (YOLO Mode)
Auto-approve all actions — fully hands-off:
```bash
gemini -y -p "Find all TODO comments in the src/ folder and create a markdown report"
```

#### 5. Resume a Previous Session
If you closed the CLI but want to pick up where you left off:
```bash
# List available sessions
gemini --list-sessions

# Resume the most recent session
gemini -r latest

# Resume a specific session by index
gemini -r 2
```

### Useful Flags & Options
- `-m, --model <model_name>`: Specify which Gemini model to use.
- `-i, --prompt-interactive <prompt>`: Execute a prompt immediately and then drop into interactive mode.
- `-s, --sandbox`: Run the agent in a sandboxed environment for safety.
- `--include-directories <paths>`: Give the agent access to additional folders outside your current workspace.
- `-d, --debug`: Run in debug mode (opens a debug console).
- `gemini mcp`: Manage MCP servers interactively.
- `gemini skills`: Manage custom agent skills.

### Pro Tips
- **Read-Only Mode:** If you want the agent to analyze your code but guarantee it won't change anything, use `--approval-mode plan`.
- **Auto-Update:** The CLI auto-updates on launch. Use `--no-auto-update` (if available) or pin a version to prevent mid-session breakage in production scripts.
- **Settings Encoding:** Always write `~/.gemini/settings.json` with a proper UTF-8 NoBOM tool (Python, `jq`, or a JSON editor) — PowerShell's default encoding breaks JSON parsing in Gemini CLI.
