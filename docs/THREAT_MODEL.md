# Threat Model: SpringBoard Local-First AI Assistant

**Date**: March 4, 2026  
**Feature**: SpringBoard Local-First AI Assistant (Branch: `001-local-ai-assistant`)  
**Classification**: Security-Critical (affects user data protection)  
**Reviewed By**: TBD (Mark Ferris, security owner)

---

## Executive Summary

SpringBoard is designed to minimize security attack surface through:
1. **Local-first architecture**: Zero cloud data transmission by default
2. **Explicit permission grants**: No implicit access to OS resources
3. **Sandboxed execution**: Tools run in isolated environments (WSL2 + Docker)
4. **Encrypted storage**: Conversation history encrypted at rest (AES-256-GCM)
5. **Comprehensive audit**: All access logged (100% audit coverage for compliance)

This document identifies potential threat actors, attack vectors, and mitigations across five attack categories.

---

## Threat Actors & Categories

### 1. **Local Malicious User** (Insider Threat)
- **Profile**: User with physical access to the machine or valid Windows login
- **Intent**: Exfiltrate conversations, grant themselves permissions, disable logging
- **Capability**: Full filesystem access via Windows shell, administrative privileges possible

### 2. **Compromised Third-Party Software** (Supply Chain)
- **Profile**: A malware-infected npm package, Python pip package, or browser extension
- **Intent**: Steal auth tokens, inject script into Electron renderer, read local database
- **Capability**: Code execution with Node.js or Electron renderer privilege level

### 3. **Network Attacker** (Man-in-the-Middle)
- **Profile**: Attacker on local network (e.g., WiFi, corporate LAN) intercepting traffic
- **Intent**: Intercept Graph API tokens, impersonate LM Studio API, hijack WebSocket IPC
- **Capability**: Network packet inspection, DNS spoofing, ARP spoofing on local network

### 4. **Remote Code Execution (RCE)** (External)
- **Profile**: Attacker exploiting a 0-day or known vulnerability in Electron, Node.js, or Python
- **Intent**: Execute arbitrary code with Electron main process privilege
- **Capability**: Depends on vulnerability severity (renderer sandbox escape, main process code injection)

### 5. **Physical Attacker** (Hardware-Level)
- **Profile**: Attacker with physical access to the machine (theft, lab access)
- **Intent**: Extract encryption keys, dump RAM, access unencrypted cache
- **Capability**: File system access, cold boot attacks, hardware probing

---

## Threat Scenarios & Mitigations

### **Threat A: Data Exfiltration (Conversations)**

#### A1 — Attacker reads local conversation database

**Scenario**: 
- Local user or malware accesses `%APPDATA%\SpringBoard\conversations.db`
- Database contains plaintext conversation history
- Attacker copies file and reads with SQLite viewer

**Impact**: HIGH
- Conversations exposed (sensitive business strategy, health data, personal information)
- Compliance violation (GDPR, HIPAA if health/personal data involved)

**Mitigations**:
- ✅ **AES-256-GCM encryption at rest**: All conversation messages encrypted with user's master key
- ✅ **Key derivation**: Master key derived from Windows DPAPI + entropy seed, NOT hardcoded
- ✅ **Transparent decryption**: Encryption layer transparent to application (encrypted-db wrapper handles transparently)
- ✅ **Key rotation**: Future Phase 2.5 feature (periodic re-encryption with new key)

**Residual Risk**: LOW
- If Windows DPAPI compromised (Tier-1 Windows vulnerability), keys exposed
- Mitigation: Comply with Windows security updates; organizations can restrict local user accounts

**Testing**: 
- [ ] Unit test: Encrypt conversation → verify ciphertext unreadable → decrypt → verify plaintext matches

---

#### A2 — User grants excessive permissions to skill

**Scenario**: 
- User sees permission dialog: "This skill needs access to Outlook calendar and email"
- User clicks "Approve" without reading
- Skill is actually malicious and exfiltrates calendar using granted permissions

**Impact**: MEDIUM
- Attacker gains explicit access to Office data via legitimately granted permission
- Attacker respects permission boundary but has broad access

**Mitigations**:
- ✅ **Granular permission model**: Permissions split into fine-grained scopes (calendar-read, mail-read, mail-send, etc.)
- ✅ **Permission visibility**: UI shows granted permissions and allows per-skill revocation (Skill Manager)
- ✅ **Audit logging**: Every permission grant/revoke/use logged with timestamp and context
- ✅ **Time-limited grants**: Permissions can have TTL (expire after N days)
- ✅ **Approval dialogs**: Every sensitive operation requires explicit user confirmation (e.g., "Draft email?" → requires approval)

**Residual Risk**: MEDIUM
- User can still grant excessive permissions if they misread the dialog
- Mitigation: Design clear permission language + periodic permission review reminders

**Testing**: 
- [ ] E2E test: Grant calendar-read permission → verify assistant can list calendar → verify assistant cannot send email
- [ ] E2E test: Revoke calendar permission → verify assistant cannot list calendar

---

#### A3 — Audit logs deleted or tampered

**Scenario**: 
- Attacker gains access to audit log files (`%APPDATA%\SpringBoard\audit\audit-*.jsonl`)
- Deletes files or edits entries to hide permission grants / tool execution
- No forensic trail of what happened

**Impact**: HIGH
- Compliance failure (immutable audit trail required for regulated workflows)
- No forensic evidence of insider threat or compromise
- Post-incident investigation impossible

**Mitigations**:
- ✅ **Append-only JSON Lines format**: Logs are immutable once written (impossible to edit without detection)
- ✅ **Daily rotation**: New log file each day (e.g., `audit-20260304.jsonl`) with gzip compression for archival
- ✅ **90-day retention**: Automatic cleanup of logs older than 90 days (configurable retention policy)
- ✅ **Centralized logging** (future Phase 3): Option to stream audit logs to syslog or SIEM (Splunk, Azure Sentinel)
- ✅ **Cryptographic integrity**: Each log entry recorded with hash of previous entry for tamper detection

**Residual Risk**: LOW (if implemented)
- Attacker can delete entire log files, but cannot edit existing entries without breaking hash chain
- Mitigation: Organizations should back up audit logs externally (syslog, SIEM, cloud storage)

**Testing**:
- [ ] Unit test: Write log entry → modify JSON file on disk → hash validation fails
- [ ] Unit test: Delete log file → audit logger creates new one automatically
- [ ] Integration test: Stream 100 entries → verify hash chain unbroken

---

### **Threat B: Privilege Escalation & Permission Abuse**

#### B1 — Malicious skill gains permissions it didn't declare

**Scenario**: 
- Developer creates a skill with manifest declaring "requires: [calendar-read]"
- At runtime, skill tries to invoke Graph API with mail-read scope
- System allows the request because user granted overly broad permissions

**Impact**: MEDIUM
- Skill performs action outside declared scope
- Permission boundaries not enforced

**Mitigations**:
- ✅ **Permission validation middleware**: Every API request validated against granted permissions
- ✅ **Manifest validation**: Skill manifest parsed and validated on install; declared permissions checked against available scopes
- ✅ **Scope enforcement**: Backend enforces exact scopes (calendar-read ≠ mail-read); mismatches rejected with 403
- ✅ **Per-request audit**: Every permission check logged (success and failure)

**Residual Risk**: LOW
- Backend strictly enforces permissions; Electron renderer cannot bypass server-side checks

**Testing**:
- [ ] E2E test: Skill declares [calendar-read] → tries mail-read → backend returns 403 Forbidden
- [ ] E2E test: Audit log shows rejected permission request

---

#### B2 — Electron renderer escapes sandbox, gains main process privilege

**Scenario**: 
- Attacker exploits a 0-day in Electron/Chromium
- Breaks out of renderer sandbox into main process
- Main process has ability to load arbitrary code / modify app behavior

**Impact**: CRITICAL
- Attacker gains full application privilege (can read any local data, modify code)
- Encryption keys potentially exposed
- Audit logs can be modified

**Mitigations**:
- ✅ **Sandboxed renderer**: Electron renderer runs in restricted sandbox (no require(), FS access)
- ✅ **IPC preload script**: All main ↔ renderer communication via typed IPC bridge (preload.ts)
- ✅ **No native modules in renderer**: Renderer cannot load native code
- ✅ **Content Security Policy (CSP)**: Strict CSP header prevents inline script injection
- ✅ **Regular Electron updates**: Keep Electron dependency current (30.0.1+) to patch 0-days promptly

**Residual Risk**: MEDIUM
- Electron 0-day is possible weakness, but requires significant attacker skill
- Mitigation: Rapid patching (update Electron within 1 week of patch release)

**Testing**:
- [ ] Attempt to require() in renderer → throws error
- [ ] Attempt to access fs from renderer → throws error
- [ ] CSP header rejects inline script execution (Content Security Policy tests)

---

### **Threat C: Tool Execution Escape & Lateral Movement**

#### C1 — Tool execution escapes sandbox and modifies host Windows

**Scenario**: 
- Skill requests to "create a folder in Documents"
- Tool runs in Docker container with Documents volume mounted
- Tool exploits container escape vulnerability to modify Windows registry or system files

**Impact**: HIGH
- System compromise (potential for malware persistence, ransomware)
- Data loss if system files modified

**Mitigations**:
- ✅ **WSL2 + Docker isolation**: Tools run in isolated Linux container, not on host Windows
- ✅ **Read-only mounts**: Non-writable directories mounted as read-only (e.g., Program Files)
- ✅ **Limited permissions**: Container runs as non-root user (uid 1000), not root
- ✅ **Resource limits**: Docker memory/CPU limits prevent resource exhaustion attacks
- ✅ **Tool allowlist**: Only approved tools can execute (no arbitrary code generation)
- ✅ **Audit trail**: Every container execution logged (image, mounts, exit code, command)

**Residual Risk**: MEDIUM
- Container escape (Linux kernel 0-day) is possible, but requires high attacker skill
- Mitigation: Keep Linux kernel (WSL2) and Docker updated

**Testing**:
- [ ] Run test tool that tries `rm -rf /` → verify it succeeds only in container, not host
- [ ] Verify host Windows systems unmodified after malicious tool execution
- [ ] Check audit log for container execution details

---

#### C2 — Tool execution performs reconnaissance and lateral movement

**Scenario**: 
- Skill requests to "search for sensitive files"
- Tool runs in container with filesystem read access
- Attacker uses tool to enumerate users, network shares, credentials on LAN
- Uses this info to attack other machines on corporate network

**Impact**: HIGH (to corporate network)
- Lateral movement to other machines
- Credential theft
- Network compromise

**Mitigations**:
- ✅ **Network isolation**: WSL2 container has limited network access (no raw sockets by default)
- ✅ **Tool scope restriction**: Tools can only access user-approved directories (e.g., Documents, not System32)
- ✅ **Audit trail**: Every file read logged (file path, tool name, skill name)
- ✅ **Tool approval**: User sees permission prompt before tool execution ("This skill wants to search YOUR FILES")
- ✅ **Manual approval per execution**: High-risk tools (shell, filesystem search) require explicit approval each time

**Residual Risk**: MEDIUM
- Attacker can still enumerate user directories if approval granted
- Mitigation: Educate users about what "search files" means; provide audit transparency

**Testing**:
- [ ] Grant filesystem read permission → verify tool can list Documents
- [ ] Verify tool cannot access other users' profiles
- [ ] Verify tool success/failure logged in audit trail

---

### **Threat D: Authentication & Credential Theft**

#### D1 — Graph API refresh token stolen

**Scenario**: 
- Attacker gains access to token store (`%APPDATA%\SpringBoard\secrets\`)
- Finds Graph API refresh_token in plaintext or weakly encrypted
- Uses token to access user's Outlook calendar/email indefinitely

**Impact**: HIGH
- Full Office data access impersonating the user
- Token valid until user explicitly revokes it

**Mitigations**:
- ✅ **DPAPI-encrypted credential store**: Refresh tokens stored in Windows Credential Manager (hardware-backed encryption)
- ✅ **Fallback encryption**: If Credential Manager unavailable, encrypted file store with AES-256
- ✅ **Token rotation**: Proactive refresh_token rotation on background schedule (24h before expiry)
- ✅ **Token revocation**: User can revoke Office permissions in Skill Manager (token discarded)
- ✅ **Audit logging**: Token refresh events logged (success, failure, timestamp)

**Residual Risk**: LOW
- DPAPI provides hardware-backed encryption (very strong)
- Attacker would need to extract key from TPM (requires specialized tools)

**Testing**:
- [ ] Store token → verify stored value is encrypted (not plaintext)
- [ ] Attempt to decrypt with wrong key → fails
- [ ] Verify token rotates before expiry (scheduler integration test)

---

#### D2 — LM Studio API called without authentication (local network attack)

**Scenario**: 
- Attacker on corporate WiFi detects LM Studio running on localhost:8000 (or internal IP:8000)
- Calls LM Studio API directly, bypassing SpringBoard's permission model
- Uses AI inference capabilities / reads prompt injection attacks

**Impact**: MEDIUM
- Unauthorized access to LM Studio inference
- Potential prompt injection if attacker crafts malicious requests

**Mitigations**:
- ✅ **Localhost-only by default**: LM Studio listens on 127.0.0.1:8000 (not 0.0.0.0:8000)
- ✅ **Firewall rules** (future): Corporate IT can restrict LM Studio port via Group Policy
- ✅ **API token validation** (future Phase 2): SpringBoard passes API token to LM Studio; API token required for inference
- ✅ **Rate limiting** (future): Limit API calls per minute to prevent DoS

**Residual Risk**: MEDIUM
- LM Studio default is localhost-only, so network attacker cannot reach it directly
- If user misconfigures to listen on 0.0.0.0, vulnerability exists
- Mitigation: Document secure LM Studio configuration + add validation check in SpringBoard startup

**Testing**:
- [ ] Verify LM Studio is listening only on 127.0.0.1 (netstat check)
- [ ] Attempt to reach from another machine → connection refused

---

### **Threat E: Supply Chain & Dependency Attacks**

#### E1 — Malicious npm package installed as dependency

**Scenario**: 
- `npm install` pulls a compromised package (e.g., typosquatting `pinia` → `pinai`)
- Package contains code that exfiltrates `%APPDATA%\SpringBoard\conversations.db` to attacker server
- Attacker collects encrypted databases and tries to decrypt

**Impact**: HIGH
- Encrypted conversation data exfiltrated
- If encryption keys compromised, conversations readable

**Mitigations**:
- ✅ **package-lock.json (lockfile)**: Exact versions pinned; prevents automatic updates to malicious versions
- ✅ **Dependency scanning**: npm audit + Supply Chain security tools (GitHub Dependabot) flag known vulnerabilities
- ✅ **Manual review**: Code review of new dependencies (check source, maintainer repo, recent commits)
- ✅ **Namespace protection**: Use official npm scopes (`@microsoft/...`, `@vue/...`)
- ✅ **Minimal dependencies**: Only import what we need (no bloated transitive dependencies)

**Residual Risk**: MEDIUM
- Typosquatting is possible but detected by Dependabot naming warnings
- Mitigation: Always review `npm audit` output before merging PRs

**Testing**:
- [ ] CI/CD gate: `npm audit` must pass before merge (fail on HIGH severity)
- [ ] Code review: Check for new dependencies in `package-lock.json` diffs

---

#### E2 — Python pip package (supply chain) compromised

**Scenario**: 
- `pip install` pulls a compromised package in `services/springboard-python/`
- Package runs arbitrary code during install (setup.py with malicious code)
- Exfiltrates system credentials, modifies Graph API wrapper to log tokens

**Impact**: HIGH
- Python runtime compromised
- If running on host Windows (not container), system-level access

**Mitigations**:
- ✅ **requirements.txt pinning**: Exact versions locked (e.g., `flask==3.0.0`, not `flask>=3.0`)
- ✅ **Dependency scanning**: `pip audit` (or Safety.io) flags known vulnerabilities
- ✅ **Manual review**: Before adding new packages, check PyPI page (download stats, author, recent updates)
- ✅ **Isolated virtual environment**: Python runs in `venv/`; cannot affect host Windows system
- ✅ **Container isolation** (Phase 2): Python eventually runs in Docker container for full isolation

**Residual Risk**: MEDIUM
- Similar to npm risks; locked versions mitigate most attacks

**Testing**:
- [ ] CI/CD gate: `pip audit` must pass
- [ ] Code review: Check for new dependencies in `requirements.txt` diffs

---

## Attack Surface Summary

| Threat | Category | Severity | Mitigation Strength | Residual Risk |
|--------|----------|----------|-------------------|----------------|
| **A1** – Conversation data exfiltration | Data Exfiltration | HIGH | AES-256-GCM encryption + DPAPI | LOW |
| **A2** – User grants excessive permissions | Data Exfiltration | MEDIUM | Granular scopes + permission UI | MEDIUM |
| **A3** – Audit logs tampered | Data Exfiltration | HIGH | Append-only + hash chain | LOW |
| **B1** – Malicious skill exceeds declared perms | Privilege Escalation | MEDIUM | Backend scope enforcement | LOW |
| **B2** – Renderer sandbox escape | Privilege Escalation | CRITICAL | Sandboxed renderer + CSP | MEDIUM |
| **C1** – Tool escape from container | Tool Execution | HIGH | Docker + WSL2 isolation + non-root | MEDIUM |
| **C2** – Tool reconnaissance/lateral move | Tool Execution | HIGH | Network isolation + audit | MEDIUM |
| **D1** – Refresh token theft | Auth/Credentials | HIGH | DPAPI credential store + rotation | LOW |
| **D2** – LM Studio unauthorized access | Auth/Credentials | MEDIUM | Localhost-only binding | MEDIUM |
| **E1** – Malicious npm package | Supply Chain | HIGH | Lockfile + npm audit | MEDIUM |
| **E2** – Malicious pip package | Supply Chain | HIGH | requirements.txt + pip audit | MEDIUM |

**Overall Risk Posture**: **MEDIUM-HIGH** (well-mitigated for typical threats; residual risk concentrated in 0-day vulnerabilities and user error)

---

## Security Controls Checklist (Implementation)

### Phase 1 (Sprint 1-3): MVP Security

- [ ] **Encryption at Rest**
  - [ ] AES-256-GCM encryption wrapper around SQLite (encrypted-db.ts)
  - [ ] Master key derivation from DPAPI + entropy
  - [ ] Unit tests: encrypt → decrypt roundtrip
  
- [ ] **Permission Model**
  - [ ] PermissionGrant entity + repository (database storage)
  - [ ] Permission validation middleware (every API request checked)
  - [ ] Audit logging on grant/revoke/check
  - [ ] Pinia store for client-side permission state

- [ ] **Audit Logging**
  - [ ] AuditLogEntry model + logger service
  - [ ] JSON Lines append-only file format
  - [ ] Daily rotation, gzip compression, 90-day retention
  - [ ] Hash-chain integrity validation

- [ ] **Credential Storage**
  - [ ] Windows Credential Manager integration (fallback: AES-encrypted file)
  - [ ] Graph API refresh_token storage + rotation
  - [ ] Token lifecycle management (preemptive refresh)

- [ ] **IPC Sandbox**
  - [ ] Electron preload.ts typed IPC bridge
  - [ ] Content Security Policy (CSP) header
  - [ ] No native module loading in renderer

- [ ] **Dependency Scanning**
  - [ ] npm audit gate in CI/CD
  - [ ] pip audit gate in CI/CD
  - [ ] package-lock.json + requirements.txt locked versions

### Phase 2 (Sprint 4-6): Advanced Security

- [ ] **Token Scheduler** (D1 mitigation)
  - [ ] Background task for refresh_token rotation (24h before expiry)
  - [ ] Failed refresh error handling + user notification

- [ ] **Docker Executor** (C1, C2 mitigations)
  - [ ] Container lifecycle management (create, run, cleanup)
  - [ ] Volume mounts with read-only enforcement
  - [ ] Non-root user execution (uid 1000)
  - [ ] Resource limits (memory, CPU)
  - [ ] Execution audit logging

- [ ] **Tool Allowlist** (C1, C2 mitigations)
  - [ ] Manifest validation for tool permissions
  - [ ] Tool approval workflow (per-skill, per-execution)
  - [ ] Scope restriction for filesystem/shell access

### Phase 3+ (Sprint 7-10): Hardening & Compliance

- [ ] **Centralized Audit Logging** (A3 mitigation)
  - [ ] syslog integration (configurable)
  - [ ] SIEM streaming (Azure Sentinel, Splunk)
  - [ ] Immutable external audit trail

- [ ] **Key Rotation** (D1 mitigation)
  - [ ] Periodic master key rotation (annually)
  - [ ] Database re-encryption with new key

- [ ] **API Rate Limiting** (D2 mitigation)
  - [ ] LM Studio API token authentication
  - [ ] Per-user rate limits

- [ ] **Penetration Testing** (all)
  - [ ] Professional security audit (contract with firm like Cure53, Evonide)
  - [ ] Sandbox escape testing
  - [ ] Crypto validation testing

---

## Incident Response Procedures

### If Attacker Gains Local Machine Access

**Immediate**:
1. Revoke all Office permissions in Skill Manager (disconnects Graph API access)
2. Change Windows password (prevents further login)
3. Audit log review: Check `%APPDATA%\SpringBoard\audit\` for unauthorized activities
4. Collect `conversations.db` for forensics (encrypted, safe to share with security team)

**Follow-up**:
- Change Azure AD password (if using Entra ID auth)
- Review Office 365 admin logs for unauthorized Outlook/SharePoint access
- Scan Windows for malware (Windows Defender / 3rd-party AV)

### If Encryption Key Compromised

**Assumptions**: Attacker has extracted master key from DPAPI or unencrypted memory dump

**Response**:
1. Revoke all sessions (shutdown SpringBoard completely)
2. Delete `%APPDATA%\SpringBoard\conversations.db` (compromised database)
3. Reinitialize database with new encryption key (Phase 2 key rotation feature)
4. Re-import conversation history from external backup (if available)

### If Audit Logs Detected Tampered

**Investigation**:
1. Compute hash chain: Each log entry should contain hash of previous entry
2. If hash breaks, identify exact line number when tampering occurred
3. Review external syslog server (if configured) for matching entries
4. Escalate to security team + compliance officers (audit trail evidence of breach)

---

## Compliance & Standards Alignment

| Standard | Requirement | SpringBoard Compliance |
|----------|-------------|----------------------|
| **GDPR** | Data subject rights (access, deletion, portability) | ✅ Local storage + encryption + audit (deletion via `rm %APPDATA%\SpringBoard\`) |
| **HIPAA** | Encryption at rest + access auditing | ✅ AES-256-GCM + audit logging |
| **SOC 2 Type II** | Availability, processing integrity, confidentiality, privacy | ✅ Audit trail + encryption + permission controls |
| **FedRAMP** | Data residency + encryption + audit | ✅ Local-first + no cloud transmission + audit |
| **Microsoft Secure Development Lifecycle (SDL)** | Secure coding, threat modeling, penetration testing | ✅ This threat model + code review + future pen testing |

---

## Sign-Off

**Threat Model Version**: 1.0  
**Date**: March 4, 2026  
**Reviewed By**: [TBD] **Mark Ferris, Security Owner**  
**Approval Status**: ⏳ **PENDING** (Awaiting security owner review)

---

## Appendix: Resource Links

- Electron Security: https://www.electronjs.org/docs/tutorial/security
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- CWE Top 25: https://cwe.mitre.org/top25/
- Windows Credential Manager API: https://learn.microsoft.com/en-us/windows/win32/api/wincred/
- Docker Security Best Practices: https://docs.docker.com/engine/security/
- Azure Security Best Practices: https://learn.microsoft.com/en-us/azure/security/
