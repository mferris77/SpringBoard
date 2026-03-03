# Research: OpenClaw Alternatives & Security

## OpenClaw Overview
OpenClaw is an open-source AI assistant framework. For Kantar, we need to evaluate alternatives and security.

## Alternatives Evaluated

| Tool | Pros | Cons | Recommendation |
|------|------|------|----------------|
| **OpenClaw** | Full-featured, active dev, local LLM | Newer project | ✅ Recommended |
| **LangChain** | Flexible, popular | Not a complete assistant | For custom builds |
| **AutoGPT** | Autonomous | Unreliable, security risks | ❌ Not enterprise |
| **Microsoft Copilot** | Integrated | Data leaves Microsoft | ❌ Compliance |
| **ChatGPT Enterprise** | Secure | Data leaves org | ❌ Compliance |

## Security Considerations

### From GitHub Security Links

**1. GitHub Agentic Workflows (gh-aw)**
- Read-only by default
- Human approval gates
- Sanitized outputs
- Sandbox execution

**2. Redamon (Red Team Framework)**
- Containerized attacks
- Useful for testing our own defenses
- Could be integrated into Security Council

### Enterprise Security Checklist

| Requirement | Implementation |
|-------------|----------------|
| ✅ SSO/SAML | Via Kantar IdP |
| ✅ Audit logging | JSONL + SIEM |
| ✅ Network isolation | Internal VPC only |
| ✅ Local LLM | Ollama—no external calls |
| ✅ Data classification | Skill scoping |
| ✅ Input sanitization | Prompt injection defense |
| ✅ Output redaction | API keys masked |
| ✅ Access control | RBAC per skill |

## Internal Deployment Model

```
Internet ─✕──► [KantarAssistant] ◄── Kantar Network
                   │
            ┌──────┴──────┐
            ▼              ▼
       [Users]        [Data]
```

- No inbound ports needed
- Users connect via VPN or office network
- All inference local

## Local LLM Options

| Model | Size | VRAM | Speed | Notes |
|-------|------|------|-------|-------|
| Llama 3.1 8B | 8B | 16GB | Fast | Good baseline |
| Qwen 3 8B | 8B | 16GB | Fast | Great for coding |
| Qwen 3 VL 8B | 8B | 16GB | Fast | Vision capable |
| Mistral Small | 12B | 24GB | Medium | Good reasoning |

## Lessons from OpenClaw

1. **Always backup config** before changes
2. **Use failback** on startup failures
3. **Security-first**: No external API keys stored
4. **Human-in-loop** for sensitive operations

## References
- OpenClaw docs: https://docs.openclaw.ai
- gh-aw: https://github.com/github/gh-aw
- Redamon: https://github.com/samugit83/redamon
