# Constitution Quickstart: Proposing Amendments

This guide walks through the process of proposing amendments (changes) to the SpringBoard Constitution.

## When to Propose an Amendment

Consider proposing an amendment when:

- A principle or rule conflicts with practical project needs
- New practices have emerged that should be codified
- Security/compliance requirements change
- The constitution needs clarification or correction
- You want to formalize an informal team practice

## Amendment Types

### Minor amendments (PATCH or MINOR version bump)
- Clarifications to existing principles
- Typo or wording fixes
- New examples or guidance added to sections
- Non-breaking modifications to governance procedures

**Example**: "Clarify that CLI JSON output MUST include error codes in error responses"

### Major amendments (MAJOR version bump)
- Adding or removing a core principle
- Redefining security or data residency policy
- Changing the governance approval process
- Removing or restructuring entire sections

**Example**: "Replace Principle I (Microsoft-First) with a cloud-agnostic provider requirement"

## How to Propose an Amendment

### 1. Create an Issue or Draft PR

Start a discussion before implementing:

```bash
# Option A: Create an issue
git issue create --title "Constitution: [CHANGE_TITLE]" --body "..."

# Option B: Open a draft PR for collaborative feedback
git checkout -b docs/constitution-amendment-[DESCRIPTION]
# (make changes)
git push -u origin docs/constitution-amendment-[DESCRIPTION]
# Then open as draft PR on GitHub
```

### 2. Document Your Proposal

In your issue or PR description, include:

- **What**: Specific text change or new section
- **Why**: The problem or opportunity triggering this amendment
- **Impact**: What projects, workflows, or policies change as a result
- **Examples**: Concrete scenarios showing the amendment in action
- **Alternative**: Why other approaches were rejected

**Template**:

```markdown
## Amendment Proposal: [TITLE]

### What
[Quote the current text or describe the new section]

### Why
- [Problem 1]
- [Problem 2]
- [Opportunity]

### Impact
- [Affected team/projects]
- [Workflow changes]
- [Version bump: MAJOR|MINOR|PATCH]

### Examples
[Concrete scenario showing the new rule in action]

### Alternatives Considered
- [Alternative 1]: Why rejected
- [Alternative 2]: Why rejected
```

### 3. Request Review

Tag the owners listed in [OWNERS.md](OWNERS.md):

- **Engineering Owner**: Reviews technical principles, workflow, templates impact
- **Security Owner**: Reviews security, compliance, data residency implications

**Example PR title**: `docs(constitution): add amendment: CLI error codes MUST include standard set`

### 4. Incorporate Feedback

Address review comments in the PR. If major changes needed:

- Update the proposal in the PR description
- Re-request review from both owners
- Document the discussion thread for future reference

### 5. Merge and Update Metadata

Once approved:

1. **Update `constitution.md`**:
   - Reflect the amendment in the text
   - Update the `Governance` section with the new content
   - Update the version line:
     ```
     **Version**: 1.1.0 | **Ratified**: 2026-MM-DD | **Last Amended**: 2026-MM-DD
     ```

2. **Update `OWNERS.md`**:
   - Add a new row to the Version History table:
     ```
     | 1.1.0   | 2026-MM-DD | 2026-MM-DD   | Active (amendment: [TITLE]) |
     ```

3. **Update `docs/CHANGELOG.md`**:
   ```markdown
   ## [1.1.0-constitution] — 2026-MM-DD

   ### Changed
   - [TITLE]: [Brief description of change]

   ### Impact
   - [Teams affected]
   - [Workflows changed]
   ```

4. **Tag the repository**:
   ```bash
   git tag -a v[NEW_VERSION]-constitution -m "Constitution v[NEW_VERSION]: [TITLE]"
   git push origin v[NEW_VERSION]-constitution
   ```

5. **Merge the PR** to main.

## Example Amendment Workflow

### Proposal: Add a new principle on Documentation

**Step 1: Open a draft PR**

```bash
git checkout -b docs/constitution-documentation-principle
# Edit constitution.md to add Principle VI
git commit -m "docs(constitution): add draft amendment: Principle VI - Documentation"
git push -u origin docs/constitution-documentation-principle
```

**Step 2: PR description**

```markdown
## Amendment: Add Principle VI - Documentation

### What
Add a new core principle requiring all public APIs, CLIs, and integrations to be documented.

### Why
- Users struggle to discover how to use new features
- Integration contracts are not documented in one place
- Documentation is currently optional and often skipped

### Impact
- All new features MUST include API docs
- CI check will enforce presence of README/docstrings for public modules
- Version bump: MINOR (new principle without removing existing ones)

### Example
The new principle:
```
### VI. Documentation is Code
All public APIs, CLIs, command-line tools, and data contracts MUST be documented as first-class requirements.
Documentation MUST be co-located with the code and reviewed in PRs...
```

### Alternatives Considered
- Add documentation requirement to existing Principle III (Test-First): Rejected because documentation is independent of testing; conflicts with "test-first" focus.
```

**Step 3: Review & feedback**

Engineering and security owners review → request changes → update PR.

**Step 4: Approve & merge**

```bash
# Update files
git add constitution.md OWNERS.md ../../docs/CHANGELOG.md
git commit -m "docs(constitution): finalize amendment: add Principle VI - Documentation (v1.1.0)"

# Tag
git tag -a v1.1.0-constitution -m "Constitution v1.1.0: Add Principle VI - Documentation"

# Merge PR and push tags
git push origin v1.1.0-constitution
```

**Step 5: Communicate**

Post in team Slack/Teams: "Constitution v1.1.0 adopted: Principle VI - Documentation now required. See [link to release]."

## Rejection / Withdrawal

If an amendment is rejected during review:

- Close the PR with a summary comment explaining why
- Document the rejection rationale in a comment (future reference)
- Proposer may request a follow-up review if new information emerges

If you want to withdraw your proposal:

- Close the PR
- No further action needed

## FAQ

**Q: Can I propose a BREAKING change to a principle?**  
A: Yes, but it requires explicit approval from both engineering and security owners and constitutes a MAJOR version bump. Consider impact on existing projects.

**Q: How long does review take?**  
A: Typically 2–5 business days. Critical security/compliance amendments may take longer.

**Q: Can multiple amendments be bundled in one PR?**  
A: Yes, if they're related. Unrelated amendments should be separate PRs for independent voting/review.

**Q: What if the owners disagree?**  
A: A consensus decision is required from both owners. If deadlocked, escalate to project leadership.

## References

- [Constitution](constitution.md) — Full text
- [OWNERS.md](OWNERS.md) — Who to contact
- [Version History](OWNERS.md#version-history) — Past amendments
- [Governance Rules](constitution.md#governance) — Formal process

---

**Need help?** Contact the engineering or security owner listed in [OWNERS.md](OWNERS.md).
