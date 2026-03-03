# Corporate AI Assistant Proposal
## Internal AI Agent Platform for Kantar

---

## Executive Summary

This proposal outlines the implementation of a secure, internal AI assistant platform (codename: **"KantarAssistant"**) based on OpenClaw technology. The platform will provide Kantar employees with an AI-powered tool to automate workflows, answer questions, and streamline data operations—all within Kantar's security perimeter.

**Target Users:**
1. **Immediate**: Mark's direct team (data processing, reporting)
2. **Phase 2**: Extended team members
3. **Phase 3**: Organization-wide deployment

---

## 1. Problem Statement

From the Feb 21, 2026 team meeting, we identified several operational challenges:

| Challenge | Current State | Impact |
|-----------|---------------|--------|
| **Google Sheets Automation** | Manual uploads, auth failures | 2-4 hours/week wasted |
| **Report Generation** | Multi-step manual process | Error-prone, slow |
| **Data Queries** | SQL/Excel only, limited access | Bottleneck on data team |
| **Documentation** | Scattered, outdated | Knowledge silos |
| **Repetitive Tasks** | Manual repetition | Low-value work |

## 2. Proposed Solution

An internal AI assistant that can:
- Connect to Microsoft 365 (Teams, SharePoint, OneDrive)
- Automate Excel/Power BI workflows via Power Automate
- Query data via Azure SQL and internal APIs
- Answer questions about data and processes
- Generate reports on demand
- Leverage Copilot Enterprise (already licensed)

**Microsoft-First Approach:** Since Kantar is a Microsoft shop with Copilot Enterprise licenses, we will:
- Build on top of Microsoft Copilot Studio for skill orchestration
- Use Azure OpenAI for LLM inference (private endpoint)
- Integrate with existing M365 ecosystem
- Minimize custom infrastructure

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Microsoft Azure Cloud                      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Azure OpenAI Service (Private Endpoint)              │   │
│  │  - GPT-4o / Codex models                             │   │
│  │  - Data stays in Kantar's Azure tenant                │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│           ┌────────────────┼────────────────┐               │
│           ▼                ▼                ▼               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   Copilot   │  │   Power     │  │    M365    │       │
│  │   Studio    │  │  Automate   │  │   (Graph)  │       │
│  │(Skill Orch) │  │ (Workflow)  │  │            │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  OpenClaw Gateway (Azure Container Apps/VM)          │   │
│  │  - SSO via Azure AD                                  │   │
│  │  - Skills: Python/JS                                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │ Azure SQL   │  │  SharePoint │  │  Internal  │       │
│  │ (Data)      │  │   Online    │  │    APIs    │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| **LLM Engine** | Azure OpenAI | Private inference via private endpoint |
| **Copilot Studio** | Microsoft Copilot Studio | Build custom copilots & skills |
| **Gateway** | OpenClaw (Azure) | Secure API bridge & skill execution |
| **Workflows** | Power Automate | Connect to 800+ connectors |
| **Data Access** | Microsoft Graph | M365, SharePoint, OneDrive |
| **Auth** | Azure AD | SSO & RBAC |

### Security Model

1. **Network Isolation**: All running within Kantar network
2. **No External APIs**: Local LLM only—zero data leaves
3. **SSO Integration**: Kantar credentials required
4. **Audit Logging**: All actions logged
5. **Data Classification**: Skills scoped by sensitivity

---

## 4. Use Cases

### Tier 1: Mark's Team (Immediate)

| Use Case | Description | Priority |
|----------|-------------|----------|
| **Google Sheets Bot** | "Generate weekly sales report in Sheet X" | High |
| **Data Query** | "What's the average response time for Q4?" | High |
| **Report Automation** | "Email me the client summary when data updates" | High |
| **Meeting Prep** | "Summarize notes from last week's standup" | Medium |

### Tier 2: Extended Team

| Use Case | Description | Priority |
|----------|-------------|----------|
| **Onboarding** | "What tools do I need for Project X?" | Medium |
| **Code Help** | "Explain this SQL query" | Medium |
| **Documentation** | "Find the API docs for endpoint Y" | Medium |

### Tier 3: Organization

| Use Case | Description | Priority |
|----------|-------------|----------|
| **HR Bot** | Benefits questions, policy lookup | Low |
| **IT Support** | Password reset, access requests | Low |
| **Research Assistant** | Find similar studies to Project Z | Low |

---

## 5. Proposed Starter Skills

Based on meeting transcript analysis and Microsoft ecosystem:

| Skill | Description | Data Source |
|-------|------------|-------------|
| **excel-manager** | Read/write Excel via Graph API | OneDrive/SharePoint |
| **report-generator** | Create reports from templates | Power BI / Excel |
| **data-query** | SQL queries on Azure SQL | Azure SQL Database |
| **teams-notify** | Send messages to Teams channels | Teams API |
| **sharepoint-search** | Search documents in SharePoint | Graph API |
| **power-automate** | Trigger/manage workflows | Power Automate API |
| **code-assist** | Explain/format SQL/Python | Azure OpenAI |

---

## 6. Development Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Deploy OpenClaw gateway on internal server
- [ ] Configure local LLM (Ollama) with enterprise models
- [ ] Set up SSO authentication
- [ ] Create "sheets-manager" skill prototype
- [ ] Security review

### Phase 2: Core Skills (Weeks 3-4)
- [ ] "report-generator" skill
- [ ] "data-query" skill  
- [ ] Connect to internal APIs
- [ ] Deploy to Mark's team (beta)
- [ ] Collect feedback

### Phase 3: Expansion (Weeks 5-8)
- [ ] Add more skills based on feedback
- [ ] Expand to extended team
- [ ] Performance optimization
- [ ] Documentation
- [ ] Training sessions

### Phase 4: Organization (Weeks 9-12)
- [ ] Organization-wide rollout
- [ ] Additional use cases
- [ ] SLA monitoring
- [ ] Continuous improvement

---

## 7. Success Metrics

| Metric | Target |
|--------|--------|
| Time saved per user/week | 5+ hours |
| Report automation coverage | 50% of recurring |
| User satisfaction | >4/5 |
| Query accuracy | >90% |
| Security incidents | 0 |

---

## 8. Risk Assessment

| Risk | Mitigation |
|------|------------|
| **Data leakage** | Local LLM only, audit logs |
| **Hallucinations** | Human-in-loop for critical tasks |
| **Auth issues** | SSO integration, role-based access |
| **Adoption** | Training, quick wins |

---

## 9. Resources Required

| Resource | Estimate |
|----------|----------|
| Development time | 40-60 hours |
| Infrastructure | 1 internal server (VM) |
| LLM hardware | GPU recommended (RTX 4080+) |
| Licenses | Open source (no cost) |

---

## 10. Next Steps

1. **Approve proposal** - Sign off on approach
2. **Infrastructure access** - Provide server/VM access
3. **Security review** - IT security assessment
4. **Pilot team** - Select 3-5 beta users
5. **Kickoff** - Start Phase 1

---

*Prepared by: Amos (AI Assistant to Mark Ferris)*
*Date: February 21, 2026*
*Version: 1.0 DRAFT*
