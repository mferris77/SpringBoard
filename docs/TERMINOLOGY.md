# Terminology: SpringBoard

**Last Updated**: March 4, 2026
**Scope**: SpringBoard planning and implementation docs
**Purpose**: Keep language consistent across specs, tasks, architecture, and sprint execution.

---

## Why This Exists

SpringBoard includes many moving parts (assistant runtime, automation, skills, scheduling, security controls, UI, and integrations). This glossary defines canonical terms so different documents do not describe the same concept with conflicting words.

---

## Canonical Terms

### Runtime and Interaction

- **Gateway**: Core WSS (WebSocket Secure) server that routes messages between channels and sessions. All inbound/outbound communication flows through the Gateway. (OpenClaw ref: https://docs.openclaw.ai/gateway)
- **Assistant Session**: A bounded runtime context for interactions, including active conversation context, permission context, and tool state. Messages from channels are routed by the Gateway to the appropriate session. (OpenClaw ref: https://docs.openclaw.ai/cli/sessions)
- **Conversation**: A persisted sequence of user and assistant messages within a session.
- **Message**: A single user or assistant chat entry routed through the Gateway.
- **Channel**: A communication interface for sending/receiving messages. Includes internal surfaces (desktop chat UI, notifications, audit views) and external platforms (MS Teams, Telegram, Slack, etc.). The Gateway routes channel messages to/from sessions. (OpenClaw ref: https://docs.openclaw.ai/channels)
- **Channel Type**: Specific channel implementation (desktop UI, MS Teams, Telegram, notification toast, audit stream, task result panel).
- **Platform**: The target operating environment where SpringBoard runs (Windows 10/11 x64, local only). Note: In OpenClaw, platform refers to device type (phone, laptop, server); in SpringBoard, it is always the user's local Windows machine.

### AI and Execution

- **Model**: An LLM endpoint used for language reasoning/generation (default: Azure OpenAI or local inference engine).
- **Inference**: A model call to produce language output (chat response, summary, transformation).
- **Inference-Conscious Policy**: Deterministic automation runs first; model inference is used only when language reasoning or generation is required.
- **Prompt**: Structured input sent to a model.
- **Tool**: A concrete capability (filesystem, shell, browser, document reader, external service adapter) invoked by skills or workflows. (OpenClaw ref: https://docs.openclaw.ai/tools)
- **Tool Call**: Invocation of a tool capability.
- **Deterministic Pre-Check**: Non-LLM logic that gathers data, detects deltas, validates thresholds, and decides whether inference is needed.
- **Execution Approval**: User confirmation required before a high-risk tool or skill executes. (OpenClaw ref: https://docs.openclaw.ai/tools/exec-approvals; SpringBoard uses permission grants instead of per-execution approvals.)
- **Loop Detection**: Mechanism to prevent infinite recursion or repeated failure sequences in automated workflows. (OpenClaw ref: https://docs.openclaw.ai/tools/loop-detection)

### Extensibility and Orchestration

- **Skill**: A pluggable capability with declared permissions, configuration, and execution entrypoint.
- **Workflow**: Ordered orchestration of one or more skills/tools to complete a user outcome.
- **Workflow Orchestrator**: Service that manages skill/tool execution order, error handling, and state passing. Reference model: OpenClaw Lobster. (OpenClaw ref: https://docs.openclaw.ai/tools/lobster)
- **Agent Rule**: Routing/orchestration logic defined in `AGENTS.md`. Similar to OpenClaw templates. (OpenClaw ref: https://docs.openclaw.ai/reference/templates/AGENTS)
- **Provider**: External service adapter (Graph API, Azure OpenAI/Inference Engine, Windows Sandbox) that tools use. (OpenClaw ref: https://docs.openclaw.ai/providers)
- **Template**: Configuration template for skill definitions or workflow patterns.
- **Process Instance (PI)**: A runtime instantiation of a workflow with specific parameters and state. (OpenClaw ref: https://docs.openclaw.ai/pi)
- **Configuration Profile**: Versioned user-config file state (`SOUL.md`, `AGENTS.md`, `USER.md`).

### Scheduling and Automation

- **Task (Scheduled Task)**: A configured automation job with cadence, required permissions, and execution metadata.
- **Heartbeat Scheduler**: Runtime service that checks due tasks and executes them while app is active.
- **Run Now**: Manual trigger for a scheduled task outside its normal cadence.

### Security and Compliance

- **Permission Grant**: Explicit user authorization for a scope (for example `outlook-calendar-read`).
- **Scope**: Fine-grained permission identifier used in policy checks.
- **Sandboxed Execution**: Tool execution isolated via Windows Sandbox (WSB) to limit host risk.
- **Audit Event**: Immutable log entry for security-relevant operations.
- **Audit Trail**: Searchable sequence of audit events retained for compliance.

### Engineering and Delivery

- **Script**: Repeatable automation command or file for setup, validation, demo, or operations.
- **Task ID**: Backlog identifier (`T001`, `T089`, etc.) in `tasks.md`.
- **Sprint**: Time-boxed delivery window defined in `sprint-plan.md`.
- **Definition of Done**: Exit criteria required for sprint completion.

---

## Term Usage Rules

- Use **Gateway** when referring to the core WSS routing server; all message flow happens through the Gateway.
- Use **Channel** for any input/output interface (internal UI or external platform like MS Teams/Telegram).
- Use **Assistant Session** for runtime context; use **Conversation** for persisted chat history.
- Use **Task** only for scheduled automation or backlog items; specify which (for example, "scheduled task" vs "backlog task").
- Use **Model Inference** for LLM calls; do not label deterministic scripts as "AI tasks".
- Use **Skill** for pluggable units and **Workflow** for multi-step orchestration.
- Use **Tool Call** for concrete system actions (filesystem/shell/browser/document operations).
- Use **Permission Scope** for authorization labels; use **Permission Grant** for user approval records.

---

## Common Anti-Patterns to Avoid

- Calling every automation step an "agent action".
- Using "session" and "conversation" as interchangeable terms.
- Saying "AI did X" when deterministic script logic executed X.
- Triggering model inference before deterministic pre-checks complete.

---

## OpenClaw Alignment

SpringBoard borrows terminology and patterns from OpenClaw:
- **Gateway** (WSS message router) is the core application component; routes all messages between channels and sessions
- **Channels** include internal UI (Vue components + Electron windows) and external platforms (MS Teams, Telegram, Slack)
- **Workflows** and **Agent Rules** are implemented via skills + AGENTS.md routing
- **Workflow Orchestrator** (Lobster reference model) informs our scheduler + skill executor architecture
- **Loop Detection** is built into task scheduler to prevent repeated failures
- **Providers** are external service adapters (Graph API, LM Studio, Docker)

OpenClaw terms **not used** in SpringBoard:
- **Platforms** (device types): SpringBoard runs only on local Windows; no phone/server/IoT variants
- **Nodes** (connected devices): SpringBoard does not manage multiple connected devices

---

## Cross-References

**SpringBoard Specs**:
- `specs/001-local-ai-assistant/spec.md`
- `specs/001-local-ai-assistant/plan.md`
- `specs/001-local-ai-assistant/tasks.md`
- `specs/001-local-ai-assistant/sprint-plan.md`
- `DEVELOPMENT.md`

**OpenClaw Docs** (reference):
- Channels: https://docs.openclaw.ai/channels
- PI (Process Instance): https://docs.openclaw.ai/pi
- Tools: https://docs.openclaw.ai/tools
- Providers: https://docs.openclaw.ai/providers
- Gateway: https://docs.openclaw.ai/gateway
- Templates (AGENTS): https://docs.openclaw.ai/reference/templates/AGENTS
- Sessions: https://docs.openclaw.ai/cli/sessions
- Exec (Execution Approvals): https://docs.openclaw.ai/tools/exec-approvals
- Lobster (Workflow Orchestrator): https://docs.openclaw.ai/tools/lobster
- Loop Detection: https://docs.openclaw.ai/tools/loop-detection
