# KantarAssistant - Technical One-Pager

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Microsoft Azure Cloud                                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Azure OpenAI Service (Private Endpoint)              │   │
│  │  - GPT-4o / Codex models                              │   │
│  │  - Customer-managed keys                              │   │
│  │  - No data leaves Azure tenant                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│           ┌────────────────┼────────────────┐               │
│           ▼                ▼                ▼               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   Copilot   │  │   Power     │  │    M365     │       │
│  │   Studio    │  │   Automate  │  │    Apps     │       │
│  │  (Extens.)  │  │  (Workflow) │  │ (Graph API) │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  OpenClaw Gateway (Azure Container Apps/VM)          │   │
│  │  - SSO via Azure AD                                   │   │
│  │  - Skills: Python/JS                                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Microsoft Integration

| Service | Purpose |
|---------|---------|
| **Azure OpenAI** | LLM inference (GPT-4o, Codex) |
| **Copilot Studio** | Build custom copilots & skills |
| **Power Automate** | Workflow automation |
| **Microsoft Graph** | M365 data access |
| **Azure AD** | SSO & identity management |
| **Azure AI Studio** | Model fine-tuning & evaluation |
| **Copilot Enterprise** | Already licensed - leverage this |

## Security Requirements

| Requirement | Implementation |
|-------------|----------------|
| **Network** | Private endpoints, no public access |
| **LLM** | Azure OpenAI—data stays in tenant |
| **Auth** | Azure AD via MSAL |
| **Data** | Sensitivity labels, DLP integration |
| **Audit** | Azure Monitor logs, 1-year retention |
| **Compliance** | Microsoft Purview ready |

## Deployment Specs

| Component | Spec |
|-----------|------|
| **Compute** | Azure Container Apps or Azure VM |
| **Auth** | Azure AD (already configured) |
| **LLM** | Azure OpenAI (private endpoint) |
| **Storage** | Azure Blob Storage (if needed) |
| **Monitoring** | Azure Monitor + Application Insights |

## Skills (Copilot Studio + Custom)

```python
# Example: Excel/Teams Skill via Microsoft Graph
class ExcelSkill:
    name = "excel-manager"
    description = "Read/write Excel files via Graph API"
    
    def run(self, prompt: str) -> str:
        # Uses Microsoft Graph API
        # Works with OneDrive/SharePoint files
        pass
```

## Integration Points

| System | Method | Auth |
|--------|--------|------|
| Microsoft 365 | Graph API | Azure AD OAuth |
| SharePoint | Graph API | Azure AD OAuth |
| Teams | Teams Bot API | Azure AD Bot |
| Power Automate | Connector | Managed Identity |
| SQL Server | Azure SQL | Managed Identity |
| Internal APIs | Azure APIM | Azure AD JWT |

## Monitoring

- **Health**: Prometheus metrics on `/metrics`
- **Logs**: Fluentd → internal SIEM
- **Alerts**: PagerDuty for failures
- **Dashboards**: Grafana (internal)

## Rollback Plan

1. Kubernetes: `kubectl rollout undo deployment`
2. VM: Snapshot + previous Docker image tag
3. Config: `config-manager.sh restore` (5 backups kept)

## Contact

- **Lead**: Mark Ferris (mark.ferris@kantar.com)
- **IT Security**: Review required before prod
- **Infrastructure**: Request VM via internal IT ticket
