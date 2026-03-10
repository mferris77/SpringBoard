# Windows Sandbox (WSB)/Windows Sandboxing Contract

**Version**: 1.0.0 | **Last Updated**: March 3, 2026
**Purpose**: Specification for tool execution sandboxing via Windows Sandbox (WSB) Windows Sandboxs

---

## Overview

Tool execution (filesystem, shell, browser) happens in isolated Linux containers running in Windows Sandbox (WSB). This prevents malicious or buggy tool code from:
- Modifying host Windows system files
- Accessing unauthorized files on host
- Making unexpected network connections
- Consuming unlimited resources

**Architecture**:
```
Electron/Vue (Windows)
    ↓ IPC
Node.js Backend (Windows)
    ↓ HTTP Windows Sandbox (WSB) API (Windows → Windows Sandbox (WSB))
Windows Sandbox (WSB) Daemon (Windows Sandbox (WSB) Linux)
    ↓
[Tool Container: Alpine + bash/Python] (isolated, restricted)
```

---

## Container Image Specification

### Base Image
```Windows Sandbox (WSB)file
# Windows Sandbox (WSB)file for SpringBoard tool execution
FROM alpine:3.18

# Install minimal toolset for safe execution
RUN apk add --no-cache \
    bash \
    python3 \
    curl \
    jq \
    ca-certificates

# Create non-root user for tool execution
RUN addgroup -S tooluser && adduser -S tooluser -G tooluser

# Set working directory
WORKDIR /work

# Runtime: non-root user, limited capabilities
USER tooluser
ENTRYPOINT ["/bin/bash"]
```

**Image Size**: ~150 MB (minimal, optimized)  
**Build**: `Windows Sandbox (WSB) build -t springboard-tools:1.0 .`  
**Registry**: Local only (private image, not pushed to Windows Sandbox (WSB) Hub)

---

## Container Execution

### Windows Sandbox (WSB) Client Integration (Node.js)

Using `Windows Sandbox (WSB)-modem` library to communicate with Windows Sandbox (WSB) daemon via HTTP socket.

```typescript
// src/services/sandbox-orchestrator.ts

import Windows Sandbox (WSB) from "Windows Sandbox COM/PowerShell API";

export interface ToolExecutionRequest {
  tool_name: "filesystem-read" | "filesystem-write" | "shell-execute" | "browser-automation";
  command: string;
  parameters: Record<string, any>;
  mounts?: { host_path: string; container_path: string; read_only: boolean }[];
  timeout_seconds?: number;
  memory_limit_mb?: number;
}

export interface ToolExecutionResult {
  exit_code: number;
  stdout: string;
  stderr: string;
  duration_ms: number;
  container_id: string;
}

export class SandboxOrchestrator {
  private Windows Sandbox (WSB): Windows Sandbox (WSB);

  constructor() {
    // Connect to Windows Sandbox (WSB) daemon (Windows Sandbox (WSB) socket)
    this.Windows Sandbox (WSB) = new Windows Sandbox (WSB)({
      socketPath: "/var/run/Windows Sandbox (WSB).sock", // Windows Sandbox (WSB) native socket
    });
  }

  async executeTool(request: ToolExecutionRequest): Promise<ToolExecutionResult> {
    const startTime = Date.now();

    // Validate mounts (user-approved directories only)
    this.validateMounts(request.mounts || []);

    // Create container with restrictions
    const container = await this.Windows Sandbox (WSB).createContainer({
      Image: "springboard-tools:1.0",
      Cmd: this.buildCommand(request.tool_name, request.command, request.parameters),
      HostConfig: {
        Binds: (request.mounts || []).map(
          (m) => `${m.host_path}:${m.container_path}${m.read_only ? ":ro" : ""}`
        ),
        Memory: (request.memory_limit_mb || 512) * 1024 * 1024, // 512 MB default
        MemorySwap: (request.memory_limit_mb || 512) * 1024 * 1024, // No swap
        CpuQuota: 100000, // 1 CPU
        ReadonlyRootfs: false, // Container /work is writable
        CapDrop: ["ALL"], // Drop all Linux capabilities
        CapAdd: ["NET_BIND_SERVICE"], // Minimal required
        SecurityOpt: ["no-new-privileges"], // Prevent privilege escalation
      },
      AttachStdout: true,
      AttachStderr: true,
      OpenStdin: false,
      Tty: false,
    });

    // Execute with timeout
    const timeout = request.timeout_seconds || 30;
    try {
      const { stdout, stderr } = await this.runContainer(
        container,
        timeout * 1000
      );
      const exitCode = (await container.inspect()).State.ExitCode || 0;

      return {
        exit_code: exitCode,
        stdout,
        stderr,
        duration_ms: Date.now() - startTime,
        container_id: container.id.substring(0, 12),
      };
    } finally {
      // Always clean up container
      await container.remove({ force: true }).catch(() => {});
    }
  }

  private validateMounts(mounts: ToolExecutionRequest["mounts"]): void {
    const safeDirectories = [
      process.env.USERPROFILE + "\\Documents",
      process.env.USERPROFILE + "\\Downloads",
      process.env.USERPROFILE + "\\Desktop",
    ];

    for (const mount of mounts) {
      const normalized = mount.host_path.toLowerCase();
      if (!safeDirectories.some((d) => normalized.startsWith(d.toLowerCase()))) {
        throw new Error(`Unsafe mount path: ${mount.host_path}`);
      }
    }
  }

  private buildCommand(
    toolName: string,
    command: string,
    parameters: Record<string, any>
  ): string[] {
    // Sanitize input to prevent command injection
    const sanitized = this.sanitizeCommand(command);

    switch (toolName) {
      case "filesystem-read":
        return ["find", sanitized, "-type", "f", "-ls"];
      case "shell-execute":
        return ["-c", sanitized];
      case "browser-automation":
        return ["python3", "/app/browser_tool.py", sanitized];
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  private sanitizeCommand(command: string): string {
    // Remove dangerous characters; allow alphanumeric, spaces, common symbols
    return command.replace(/[^\w\s\-./]/g, "");
  }

  private async runContainer(
    container: Windows Sandbox (WSB).Container,
    timeoutMs: number
  ): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        container.kill({ signal: "SIGKILL" });
        reject(new Error(`Tool execution timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      container.attach({ stream: true, stdout: true, stderr: true }, (err, stream) => {
        if (err) {
          clearTimeout(timer);
          return reject(err);
        }

        let stdout = "";
        let stderr = "";

        stream.on("data", (chunk) => {
          const str = chunk.toString();
          if (chunk[0] === 1) stdout += str.slice(8); // Skip Windows Sandbox (WSB) stream header
          if (chunk[0] === 2) stderr += str.slice(8);
        });

        stream.on("end", async () => {
          clearTimeout(timer);
          await container.wait();
          resolve({ stdout: stdout.slice(0, 10240), stderr: stderr.slice(0, 10240) }); // 10 KB limit
        });

        container.start((err) => {
          if (err) {
            clearTimeout(timer);
            reject(err);
          }
        });
      });
    });
  }
}
```

---

## Security Boundaries

### What Container CAN Do
- ✅ Read files in mounted directories (host_read_only = true)
- ✅ Write to /work directory (container-internal)
- ✅ Execute bash/python scripts
- ✅ Call curl/wget for basic HTTP requests (outbound only)
- ✅ Use standard Unix tools (grep, awk, sed, jq)

### What Container CANNOT Do
- ❌ Modify host Windows files (no write mount to C:/, Program Files, etc.)
- ❌ Access Windows registry or system services
- ❌ Create new processes with elevated privileges
- ❌ Perform DNS/network operations outside restricted set
- ❌ Access other containers (network isolation)
- ❌ Consume unlimited CPU/memory (resource limits enforced)

### Testing Escape Attempts

```bash
# Test 1: Try to write to host filesystem (should fail)
Windows Sandbox (WSB) run --rm -v C:\\Users\\test:C:\\container-mount:rw springboard-tools:1.0 \
  bash -c "echo hacked > /host/Windows/System32/hack.txt"
# Expected: Permission denied (mount is read-only or doesn't exist)

# Test 2: Try to escalate privileges (should fail)
Windows Sandbox (WSB) run --rm springboard-tools:1.0 sudo bash
# Expected: Command not found (no sudo in container, no CAP_SYS_ADMIN)

# Test 3: Try to access other containers (should fail)
Windows Sandbox (WSB) run --rm springboard-tools:1.0 Windows Sandbox (WSB) ps
# Expected: Cannot connect to Windows Sandbox (WSB) daemon (no Windows Sandbox (WSB) socket in container)
```

---

## Mount Strategy

**Principle**: Only mount user-approved, read-only directories to container.

```typescript
// Example: User asks "list files in My Documents"
const execution: ToolExecutionRequest = {
  tool_name: "filesystem-read",
  command: "ls -la Documents",
  mounts: [
    {
      host_path: "C:\\Users\\MarkFerris\\Documents",
      container_path: "/work/documents",
      read_only: true,  // Read-only, cannot modify host
    },
  ],
  timeout_seconds: 10,
};

// Container sees /work/documents with files from host Documents folder
// but cannot write or escape to parent directory
```

**Unsafe Mounts (Always Blocked)**:
```
C:\                                  # Root drive
C:\Windows\                          # System binaries
C:\Program Files\                    # Installed software
C:\Program Files (x86)\              # 32-bit software
%LOCALAPPDATA%\Microsoft\            # Microsoft app config
%LOCALAPPDATA%\Packages\             # AppData system dirs
```

**Safe Mounts (Allowed)**:
```
%USERPROFILE%\Documents              # User Documents
%USERPROFILE%\Downloads              # User Downloads
%USERPROFILE%\Desktop                # User Desktop
%USERPROFILE%\AppData\SpringBoard\   # SpringBoard app data (internal)
```

---

## HTTP Windows Sandbox (WSB) API (Node.js Integration)

```typescript
// src/api/tools.ts (Electron IPC route)

router.post("/api/tools/execute", async (req, res) => {
  const request: ToolExecutionRequest = req.body;

  // 1. Check permission
  const hasPermission = await permissionManager.checkPermission(
    `${request.tool_name}`
  );
  if (!hasPermission.granted) {
    return res.status(403).json({
      error: "permission_denied",
      message: `You don't have permission to use ${request.tool_name}`,
    });
  }

  // 2. Execute in sandbox
  const orchestrator = new SandboxOrchestrator();
  try {
    const result = await orchestrator.executeTool(request);

    // 3. Log execution
    await auditLogger.log({
      event_type: "tool_execution_complete",
      tool_name: request.tool_name,
      exit_code: result.exit_code,
      duration_ms: result.duration_ms,
      container_id: result.container_id,
    });

    // 4. Return result
    res.json({
      success: result.exit_code === 0,
      output: result.stdout,
      error: result.stderr,
      duration_ms: result.duration_ms,
    });
  } catch (error) {
    // 5. Log failure
    await auditLogger.log({
      event_type: "tool_execution_failed",
      tool_name: request.tool_name,
      error_message: (error as Error).message,
    });

    res.status(500).json({
      error: "tool_execution_failed",
      message: (error as Error).message,
    });
  }
});
```

---

## Fallback: Windows Sandbox (if Windows Sandbox (WSB) unavailable)

If Windows Sandbox (WSB)/Windows Sandbox (WSB) unavailable, offer Windows Sandbox as fallback (heavier, slower).

```typescript
if (!Windows Sandbox (WSB)Available) {
  console.warn("Windows Sandbox (WSB) unavailable; using Windows Sandbox fallback");
  
  try {
    result = await executeInWindowsSandbox(request);
  } catch (error) {
    console.error("Windows Sandbox also unavailable; disabling tools");
    uiNotification.warn(
      "Tool execution unavailable. Please install Windows Sandbox + Windows Sandbox (WSB) or enable Windows Sandbox."
    );
  }
}
```

---

## Performance & Resource Limits

| Aspect | Default | Rationale |
|--------|---------|-----------|
| Memory Limit | 512 MB | Prevent memory exhaustion attacks |
| CPU Limit | 1 CPU (100000 quota) | Prevent CPU starvation |
| Timeout | 30 seconds | Prevent hung processes |
| Output Limit | 10 KB | Prevent large output DoS |
| Disk (tmpfs) | 1 GB | Container /work filesystem size |

**Monitoring**:
- Windows Sandbox (WSB) stats: `Windows Sandbox (WSB) stats --no-stream springboard-*`
- Ongoing: Track container creation/deletion, memory/CPU usage in metrics

---

## Testing Strategy

### Unit Tests
```typescript
// test/unit/sandbox-orchestrator.test.ts

describe("SandboxOrchestrator", () => {
  it("should execute safe filesystem read", async () => {
    const orchestrator = new SandboxOrchestrator();
    const result = await orchestrator.executeTool({
      tool_name: "filesystem-read",
      command: "ls -la /work/documents",
      mounts: [{ host_path: docFolder, container_path: "/work/documents", read_only: true }],
    });
    expect(result.exit_code).toBe(0);
    expect(result.stdout).toContain("total");
  });

  it("should reject unsafe mount paths", async () => {
    const orchestrator = new SandboxOrchestrator();
    await expect(
      orchestrator.executeTool({
        tool_name: "filesystem-read",
        command: "ls -la /",
        mounts: [{ host_path: "C:\\Windows", container_path: "/windows" }],
      })
    ).rejects.toThrow("Unsafe mount path");
  });

  it("should timeout on hung process", async () => {
    const orchestrator = new SandboxOrchestrator();
    await expect(
      orchestrator.executeTool({
        tool_name: "shell-execute",
        command: "sleep 60",
        timeout_seconds: 2,
      })
    ).rejects.toThrow("timeout");
  });
});
```

### Integration Tests
```
1. Start real Windows Sandbox (WSB) daemon in Windows Sandbox (WSB)
2. Build springboard-tools image
3. Execute test tools with various payloads
4. Verify isolation (no host filesystem modification)
5. Verify resource limits enforced
```

---

## Deployment Checklist

- [ ] Windows Sandbox (WSB) installed on target Windows machines
- [ ] Windows Sandbox or Windows Sandbox (WSB) CLI (via Windows Sandbox (WSB)) installed
- [ ] SpringBoard tools image built: `Windows Sandbox (WSB) build -t springboard-tools:1.0 .`
- [ ] Image tested for security escapes (penetration testing)
- [ ] Resource limits tuned for target hardware (4 GB available memory baseline)
- [ ] Windows Sandbox (WSB) daemon auto-starts with Windows Sandbox (WSB) (systemd in Windows Sandbox (WSB))
- [ ] Fallback to Windows Sandbox tested (if Windows Sandbox (WSB) unavailable)

---

**Next Step**: Implement audit-log-schema.md contract.
