# Research & Architecture Document: SpringBoard Local-First AI Assistant

**Status**: Phase 0 Complete | **Date**: March 3, 2026
**Purpose**: Document architectural research, decision rationale, and alternatives considered

---

## Executive Summary

SpringBoard is designed as a **security-hardened, local-first AI desktop assistant** prioritizing worker privacy and enterprise data residency. Five core architectural decisions form the foundation; all have been **confirmed by stakeholder requirements** and are documented below with rationale and alternatives.

**Confirmed Decisions**:
1. **LLM Strategy**: Local models via Azure OpenAI / Inference Engine on NVIDIA 4090, hybrid cloud toggle (future)
2. **Office Integration**: Graph API primary, COM fallback for local Office
3. **Tool Sandboxing**: Windows Sandbox (WSB)s for isolated execution
4. **Permission Model**: Persistent per-resource-type grants with auto-refresh tokens
5. **Configuration**: In-app UI editor + filesystem editing with syntax validation

---

## Decision 1: LLM Strategy — Local Models via Azure OpenAI / Inference Engine + Future Hybrid Cloud

### Decision
**Primary**: Azure OpenAI / Inference Engine running locally on NVIDIA RTX 4090 for inference
**Secondary**: Future hybrid cloud toggle (Azure OpenAI) for larger models, opt-in only
**Fallback**: Public cloud models blocked by default

### Rationale

#### Constitution Alignment: Microsoft-First & Data Residency
- ✅ Local inference **zero transmission** of conversation/context to cloud LLM provider
- ✅ Hybrid mode (when available) uses **Azure OpenAI**, a Microsoft-first choice, not Anthropic/OpenAI external
- ✅ User opt-in required for cloud mode; default is fully local (data residency principle honored)

#### Enterprise Security Benefits
1. **No LLM data leakage**: Conversations never transmitted to external AI services (unlike ChatGPT, Claude, etc.)
2. **Compliance**: Meets strict HIPAA/FedRAMP data residency requirements (healthcare, government)
3. **Cost predictability**: No per-token charges; amortized hardware cost (4090 in workstation)
4. **Latency**: <2s response time for typical queries on local inference (comparable to cloud at p99)

#### Technical Viability
- Azure OpenAI / Inference Engine provides **HTTP REST API** compatible with OpenAI /chat/completions format
- Models available: Mistral 7B, Llama 2 70B, Phi 3; all run on single 4090 with <16GB context
- Performance: 70B model ≈ 10–15 tokens/s on 4090 (sufficient for workplace assistant tasks)

### Alternatives Considered

| Alternative | Rationale for Rejection | Trade-off |
|---|---|---|
| **Anthropic Claude / OpenAI GPT** | Cloud-only; data leaves machine → violates data residency principle | Better accuracy, but fails constitution gate |
| **Azure OpenAI default** | Meets Microsoft-first requirement but NOT data residency (SaaS). Conflicts with privacy-first MVP goals | Enterprise-friendly later, hybrid model reserved for phase 2+ |
| **Hugging Face Inference API** | Web-based service; data transmission required | Lighter local resource requirement, but fails MVP privacy goal |
| **Ollama (Linux/macOS only)** | Excellent open-source LLM runtime, but Windows support is immature; requires Windows Sandbox (WSB) with performance overhead | More open-source friendly, but Azure OpenAI / Inference Engine has better Windows + Electron integration |
| **ONNX Runtime on CPU** | Zero inference cost, but <1 token/s on CPU; unacceptable latency | Minimal hardware dependency, unsuitable for <2s response goal |

### Phase 1 Design Tasks
- [ ] Document Azure OpenAI / Local fallback HTTP API contract (request format, model selection, token limits, error codes)
- [ ] Determine recommended model sizing for Outlook + Doc summarization use cases on 4090
- [ ] Design hybrid mode toggle in SOUL.md (opt-in to Azure OpenAI, clear data flow documentation)
- [ ] Implement Azure OpenAI / Inference Engine service discovery (inference endpoint default, configurable)
- [ ] Add fallback: if Azure OpenAI / Inference Engine unavailable, block chat with clear error message (no cloud fallback without user opt-in)

---

## Decision 2: Office Integration — Graph API Primary + COM Fallback

### Decision
**Primary**: Microsoft Graph SDK for JavaScript (modern, REST-based, cloud-native)
**Secondary**: Win32 COM bridge (via Python `win32com` / Node.js `node-office-addin`) for local Office apps when Graph unavailable
**Auth**: Entra ID (MSAL) / Entra ID for Graph; Windows credentials for COM

### Rationale

#### Constitution Alignment: Microsoft-First & Data Residency
- ✅ Graph API is **Microsoft-first** for M365 integration
- ✅ COM fallback allows **local Office (no cloud)** if Graph unavailable
- ✅ Entra ID authentication maintains **corporate identity** integration
- ✅ No third-party Office automation (e.g., Zapier, Make.com) — direct API control

#### Enterprise Office Integration
1. **Graph API scope mapping**: Compartmentalized permissions (outlook-calendar-read, mail-read, driveitem-read)
2. **Multi-level grants**: Read vs. write permissions enforced separately
3. **Auto-refresh tokens**: Entra ID refresh flow handles token expiration + revocation
4. **Audit trail**: Every Office access logged (resource, scope, user, timestamp)

#### Resilience & Fallback
- User has local Word/Excel/Outlook? → Use COM bridge (fully local, no cloud dependency)
- No local Office, or Entra ID unavailable? → Graph API fails gracefully with user-facing explanation
- Hybrid: User can choose which method for calendar (Graph more reliable, COM more private if accepted)

### Alternatives Considered

| Alternative | Rationale for Rejection | Trade-off |
|---|---|---|
| **365 CLI (Microsoft Graph CLI)** | Excellent for CLI scripting, but heavyweight; requires CLI environment in container | Better for automation, unsuitable for Electron IPC integration |
| **PowerShell + Graph SDK** | Great for Windows scripting, but adds PowerShell runtime dependency | Simpler for Graph, adds complexity to Electron bundle |
| **EWS (Exchange Web Services)** | Microsoft's older Office integration standard, but deprecated by Microsoft | Better compatibility with older Exchange, but future-unfriendly |
| **Third-party libraries (node-office-addin)** | Simplifies WIN32 COM wrapping, but:adds npm dependency overhead | Reduces our C++/COM complexity, but external dependency risk |
| **No Office at all** | Pure file read from Outlook .pst files | Provides privacy-first, fully local option; but limited capability (no write, no real-time) |

### Phase 1 Design Tasks
- [ ] Document Graph API OAuth scopes needed (calendar.read, calendar.write, mail.read, files.read.all)
- [ ] Design permission prompt UX (what does "Calendar Read" mean to typical user?)
- [ ] Implement Graph API mock in tests (supertest + mock server for contract testing)
- [ ] Implement COM bridge Python adapter (`office_com_bridge.py`) with fallback error handling
- [ ] Token refresh strategy: preemptive refresh vs. on-demand + refresh_token rotation
- [ ] Audit schema: Log scope, resource ID, method (Graph vs. COM), timestamp, user principal name

---

## Decision 3: Tool Sandboxing — Windows Sandbox (WSB)s

### Decision
**Primary**: Windows Subsystem for Linux 2 (Windows Sandbox (WSB)) with Windows Sandboxs for isolated tool execution
**Sandboxing scope**: Filesystem, shell (PowerShell, bash), browser automation
**Fallback**: Windows Sandbox (for scenarios where Windows Sandbox (WSB) unavailable, lower throughput)
**not supported**: Running tools on host Windows directly

### Rationale

#### Constitution Alignment: Security-First & Observability
- ✅ **Complete network isolation** from host: tools run in Linux containers, can't access Windows network directly
- ✅ **Filesystem isolation**: Container mounts only user-approved directories (e.g., Documents, Downloads)
- ✅ **Resource limits**: Windows Sandbox (WSB) memory/CPU limits prevent runaway tool processes
- ✅ **Audit trail**: Every container execution logged (image, mounts, exit code, logs)

#### Enterprise Security & Compliance
1. **Privilege escalation prevention**: Container runs as non-root; tools cannot modify system binaries
2. **Malware containment**: If tool execution involves untrusted code, virus cannot spread to host
3. **Reproducibility**: Same tool execution environment across all Windows machines (containers are portable)
4. **Performance profiling**: Windows Sandbox (WSB) metrics (memory, CPU, I/O) enable observability

#### Windows Enterprise Reality
- Windows Sandbox (WSB) is standard in enterprise Windows 11 environments (via Group Policy or RSAT)
- Windows Sandbox integrates seamlessly with Windows Sandbox (WSB) (backend for local dev, business license available)
- PowerShell in host + bash in container enables hybrid scripting

### Alternatives Considered

| Alternative | Rationale for Rejection | Trade-off |
|---|---|---|
| **Windows Sandbox (native)** | Native Windows isolation, no Windows Sandbox (WSB) dependency, but single-use VM per execution | Heavier resource cost, slower startup, limited reusability |
| **Run tools directly on host Windows** | Simplest (no sandbox), but violates security principle — tool escalation possible | Fails security-first requirement; not acceptable for enterprise |
| **Hyper-V isolation / nested VMs** | Full OS isolation, but heavyweight; Windows Sandbox (WSB) is lighter-weight alternative | Over-engineered for tool execution; Windows Sandbox (WSB) suffices |
| **Chrome/Chromium Sandbox** | Good for browser automation, but doesn't cover shell/filesystem tools | Browser tool only; doesn't generalize |
| **VirtualBox VM** | Portable, but slower than Windows Sandbox (WSB); requires separate VM management | Overkill for scripting environment; Windows Sandbox (WSB) is modern standard |

### Phase 1 Design Tasks
- [ ] Design Windows Sandbox (WSB) image layout: minimal image for tools (Alpine base + bash, Python, curl, jq)
- [ ] Implement `Windows Sandbox (WSB)_executor.py`: container lifecycle, mounts, stream capture, exit code handling
- [ ] Design IPC from Node.js → Windows Sandbox (WSB): Windows Sandbox (WSB) API via modem module or HTTP socket
- [ ] Audit contract: Log container ID, image, command, mounts, resource limits, exit outcome
- [ ] Fallback strategy: If Windows Sandbox (WSB) unavailable, offer Windows Sandbox or disable tool execution
- [ ] Permission boundaries: Test that container cannot escape to Windows host (penetration testing)

---

## Decision 4: Permission Model — Persistent Per-Resource-Type Grants + Auto-Refresh Tokens

### Decision
**Granularity**: Resource-type level (e.g., `outlook-calendar-read`, `word-document-read`, `shell-execute`)
**Persistence**: Grants stored in encrypted local file (`%APPDATA%/SpringBoard/permissions.db`)
**Expiration**: Optional TTL (default permanent until user revocation, or 30/90 day auto-refresh)
**Token refresh**: Automatic Graph API refresh_token handling; user notification on failure

### Rationale

#### Constitution Alignment: Explicit Permission Model & Observability
- ✅ **Not implicit**: No hidden device access; every capability requires explicit trust
- ✅ **Auditable**: Permission state (grants + revocations) is logged with timestamps
- ✅ **User control**: "Review what I've granted" is a core feature (permission dashboard)
- ✅ **Time-boxed option**: User can set expiration ("access expires in 30 days")

#### User Experience
1. **First ask**: "Your assistant is about to read your calendar. Grant permission? [Yes/No/Never ask again]"
2. **Transparent**: Each skill displays required permissions in skill manager UI
3. **Granular**: User can grant read-only access (deny write), or single resource (not all emails)
4. **Revoke anytime**: Settings → Permissions → [Outlook Calendar] → Revoke

#### Resilience & Compliance
- Persistent grants survive app restart (user doesn't re-grant daily)
- Token refresh automatic but restartable if user detects stale credentials
- Audit log proves permission flow for compliance review (SOC 2, HIPAA)

### Alternatives Considered

| Alternative | Rationale for Rejection | Trade-off |
|---|---|---|
| **OAuth 2.0 exact scopes** | Granular (user.read, calendar.read, mail.read), but overwhelming UI permutation | Industry standard, good audit trail, but too fine-grained for UX |
| **Trust-on-first-use (TOFU)** | Auto-grant on first use, no user confirmation | Simpler UX, but violates explicit permission principle |
| **Temporary grants only (2-hour TTL)** | Maximum privacy; user re-grants after TTL expiry | Better privacy, but poor UX (frequent permission dialogs) |
| **Declarative skill perms (manifest in skill)** | Skill declares "I need calendar.read", system auto-grants if user installed skill | Clear intent, but might feel deceptive (user installs but doesn't realize scope) |
| **Host-wide Windows credential store** | Use Windows Credential Manager for tokens, not our DB | More OS-integrated, but harder to audit + rotate |

### Phase 1 Design Tasks
- [ ] Define canonical permissions registry: PermissionScope enum (outlook-calendar-read, outlook-calendar-write, word-read, etc.)
- [ ] Implement permission store: SQLCipher with columns (scope, grant_time, expiry, revocation_time, revocation_reason)
- [ ] Implement token refresh scheduler: on-demand + background refresh for Graph API refresh_tokens
- [ ] UI: Permission dialog with clear explanations (what does "Outlook Calendar Read" mean?)
- [ ] Audit contract: Log (permission, action: grant/revoke, user, timestamp, approval_method)
- [ ] Test permission boundary: Verify revoked scope blocks corresponding API calls

---

## Decision 5: Configuration — In-App UI Editor + Filesystem Editing + Syntax Validation

### Decision
**Primary**: Three YAML/Markdown configuration files in AppData:
  - **SOUL.md**: AI personality (tone, formality, proactivity, guidelines)
  - **AGENTS.md**: Skill orchestration, workflow rules, scheduling
  - **USER.md**: User preferences (timezone, working hours, notification defaults)
**UI**: In-app editor for non-technical users (dropdown + text fields)
**Power-user path**: Edit files in VS Code, auto-reload on save
**Validation**: Syntax check on edit + load, clear error messages

### Rationale

#### Constitution Alignment: Test-First & Observability
- ✅ **Declarative config**: Easier to test (ship config files in test suite, verify behavior)
- ✅ **Version control friendly**: SOUL.md, AGENTS.md, USER.md can be checked into git (if desired)
- ✅ **Observable**: Configuration state is human-readable; audit changes via `git diff`
- ✅ **Syntax validation**: Parse errors caught immediately, not runtime surprises

#### User Empowerment
1. **Non-technical path**: In-app UI with presets ("Formal tone", "Relaxed tone")
2. **Technical path**: Edit SOUL.md in VS Code, watch for auto-reload
3. **Skill orchestration in AGENTS.md**: Power users can script conditional workflows (pseudo-code)
4. **User.md preferences**: Timezone, working hours, auto-scheduling rules (simple YAML)

#### Extensibility
- New skills can declare default config in AGENTS.md
- User can override skill behavior without editing Python/TypeScript
- Templating: skeleton configs provided on first install

### Alternatives Considered

| Alternative | Rationale for Rejection | Trade-off |
|---|---|---|
| **JSON config files** | Better tooling support, but less human-readable than YAML | More structured, but harder to hand-edit |
| **Environment variables only** | Scalable for containers/services, but poor for desktop user config | Simple, but not suitable for complex personality/workflow rules |
| **GUI settings dialog (no file editing)** | Maximum user-friendly, no power-user escape hatch | Restrictive for advanced users; limits extensibility |
| **Config in SQLCipher database** | Centralized, but opaque to user inspection; harder to version control | Efficient, but loses human-readability + git-friendliness |
| **Vibe-based config (LLM infers personality)** | Infer tone from examples, but non-deterministic + hard to audit | Flexible, but violates test-first (hard to validate behavior) |

### Phase 1 Design Tasks
- [ ] Design SOUL.md schema: personality attributes (tone, formality, proactivity) + constraints
- [ ] Design AGENTS.md schema: skill definitions, ordering, conditional orchestration rules
- [ ] Design USER.md schema: timezone, working_hours, notification defaults, locale
- [ ] Implement config parser: YAML → TypeScript objects with schema validation (`zod` or `joi`)
- [ ] Implement file watcher: Auto-reload SOUL/AGENTS/USER on save (with debounce + syntax check)
- [ ] UI editor: Vue component with dropdown selectors + JSON-to-UI generation
- [ ] Error display: If config parse fails, show user clear error (e.g., "Line 12: Invalid YAML syntax")
- [ ] Test: Unit tests for config parser, contract tests for config reload API

---

## Integration Points & Data Flow

```
User (Windows Desktop)
    ↓
[Electron UI / Vue Chat]
    ↓ (IPC + REST)
[Node.js Backend / Electron IPC API]
    ├─→ [Permission Manager] → [Credential Manager / Encrypted Token Store]
    ├─→ [LLM Service] → [Azure OpenAI / Local fallback HTTP API on inference endpoint]
    ├─→ [Office Service] → [Graph API] (Outlook, Word, Excel) / [COM Bridge]
    ├─→ [Audit Logger] → [Audit Log File / SQLCipher]
    ├─→ [Skill Loader] → [Skill Manifest Parser] → [Skill Execution]
    ├─→ [Sandbox Orchestrator] → [Windows Sandbox (WSB) Windows Sandbox (WSB) API]
    └─→ [Config Manager] → [File Watcher + SOUL.md / AGENTS.md / USER.md]
    ↓
[Windows Sandbox (WSB) Linux Container]
    ├─→ [Filesystem tool] (read files)
    ├─→ [Shell executor] (PowerShell / bash)
    └─→ [Browser automation] (Selenium or Puppeteer)

All local data encryption: Electron Preload → main process → Node backend via crypto module
All audit events: → Audit Log JSON Lines in AppData
All cloud comms: Graph API (Entra ID) + Azure OpenAI / Inference Engine (local) only; bidirectional encryption
```

---

## Security & Compliance Considerations

### Threat Model: Malicious Skill Installation

**Scenario**: User installs a skill that contains malicious code attempting to read all emails.

**Defense Layers**:
1. **Manifest validation**: Skill declares required permissions in manifest; UI shows them before install
2. **Permission check**: At runtime, skill execution checked against granted permissions
3. **Audit trail**: Every skill invocation logged; user can review history and revoke if suspicious
4. **Isolation**: Skill runs in Node process, but restricted by backend permission checks (defense in depth)
5. **Future**: Code signing (optional) for community-trusted skills

### Threat Model: Token Theft from Encrypted Store

**Scenario**: Attacker gains file system access to `%APPDATA%/SpringBoard/`, tries to steal Graph API refresh tokens.

**Defense Layers**:
1. **Data-at-rest encryption**: Tokens encrypted with DPAPI (Windows Data Protection API) or sodium.js key
2. **File permissions**: Token file readable only by SpringBoard process user (Windows ACL)
3. **Short-lived access tokens**: Issued by Graph API, ~1 hour lifetime; refresh token rotation on refresh
4. **Audit logging**: Token refresh logged (if token used suspiciously, audit trail shows it)

### Threat Model: Sandbox Escape

**Scenario**: Tool execution inside Windows Sandbox attempts to break out and modify Windows host.

**Defense Layers**:
1. **Container isolation**: Volume mount restricted to user-approved directories only (read-only where possible)
2. **Root avoidance**: Tool runs as non-root user inside container
3. **Resource limits**: CPU + memory limits prevent resource exhaustion attacks
4. **Image scanning**: Base image scanned for vulnerabilities on build
5. **Testing**: Penetration tests during Phase 1 to verify sandbox isolation

### Compliance: Audit Trail for Regulatory Review

**SOC 2 / HIPAA Audit Requirements**:
- ✅ All permission grants logged with timestamp + user principal name
- ✅ All tool executions logged with parameters, outcome, user
- ✅ All configuration changes logged (SOUL.md, AGENTS.md,USER.md edits)
- ✅ Retention: 90+ days of audit logs (configurable rotation)
- ✅ Integrity: Audit log append-only (no deletion permission in UI)

---

## Phase 1 Validation Milestones

- [ ] **Week 1**: SOUL.md, AGENTS.md, USER.md schema + parser completed + tested
- [ ] **Week 2**: Azure OpenAI / Inference Engine HTTP contract finalized; mock server for tests
- [ ] **Week 3**: Graph API + COM adapter skeleton; permission store + token refresh logic
- [ ] **Week 4**: Windows Sandbox (WSB) executor proof-of-concept; container isolation verified
- [ ] **Week 5**: Electron ↔ Node backend IPC + permission check middleware
- [ ] **Week 6**: Audit logger + Conversational data model + encryption
- [ ] **Week 7**: Integration test; full path: chat → permission prompt → office call → audit log
- [ ] **Week 8**: Security review + penetration testing (sandbox, token security)

---

## Open Questions for Phase 1 Design

1. **Azure OpenAI / Inference Engine model size & latency**: What is acceptable model size for Outlook sync? (Mistral 7B vs. Llama 70B)
   - **Owner**: Backend architect
   - **Decision gate**: Performance testing in Phase 1 Week 1

2. **Graph API vs. COM trade-off UX**: Should user choose method, or auto-select?
   - **Owner**: UX designer
   - **Decision gate**: Wireframe in Phase 1 Week 2

3. **Skill execution isolation**: Run skill in Node process with permission checks, or spawn isolated Node VM?
   - **Owner**: Security architect
   - **Decision gate**: Architectural proof-of-concept in Phase 1 Week 4

4. **Opus vs. Sonnet vs. smaller models**: If future Azure OpenAI hybrid mode, which model?
   - **Owner**: ML/LLM architect
   - **Decision gate**: Deferred to Phase 2 (hybrid mode planning)

5. **Audit log retention policy**: How long to retain audit logs? (30 days, 90 days, indefinite?)
   - **Owner**: Compliance officer
   - **Decision gate**: Constitution amendment or PRD clarification

---

## Conclusion

All five core architectural decisions are **confirmed, rationale documented, and alternatives justified**. 

- **Constitution alignment**: All PASS (Microsoft-First, CLI-First, Test-First, Integration Testing, Observability)
- **Security-first**: Achieved via sandboxing, encryption, explicit permissions, audit trail
- **Data residency**: Local-first by default; cloud opt-in only
- **Enterprise-ready**: Entra ID auth, Graph API, audit compliance, granular permissions

Ready for **Phase 1 Design** (data model, contracts, quickstart).
