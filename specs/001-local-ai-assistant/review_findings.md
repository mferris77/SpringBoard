# SpringBoard Spec & Plan Review Findings

Overall, the plan is **exceptionally detailed, sound, and well-structured**. The 10-sprint breakdown, phase dependency mapping (in `tasks.md`), and strict adherence to the constitution (local-first, security-first) are excellent. 

However, looking closely at the architectural choices across `spec.md`, `plan.md`, and `sprint-plan.md`, I have identified a few oversights, potential improvements, and unclear references.

## 1. Architectural Oversight: Localhost Express Server in an Electron App
- **The Issue**: `plan.md` defines an Electron frontend (`apps/springboard-desktop`) and a separate Node.js Express/Fastify backend (`apps/springboard-backend`) running on a local port (e.g., `localhost:3000`).
- **The Risk**: In enterprise Windows environments, binding a Node process to a TCP port often triggers Windows Defender or local firewall prompts. Asking users to allow firewall access for a local assistant is a poor UX and security smell.
- **The Improvement**: For a desktop app, the "backend" should typically be the **Electron Main process**. Communication between the Vue frontend and the backend should happen via **Electron IPC** (Inter-Process Communication), not HTTP/REST. If you must keep them cleanly separated as packages, the Node backend logic can be imported into the Electron Main process, or they can communicate over Named Pipes to avoid TCP port binding.

## 2. LM Studio Dependency & Lifecycle
- **The Issue**: Sprint 3 (`sprint-plan.md`) relies on the user to manually start LM Studio in a separate terminal before the assistant works.
- **The Risk**: This is a major friction point for workplace users who expect an "it just works" desktop app.
- **The Improvement**: SpringBoard should manage the LLM headless server lifecycle automatically. You could bundle the LM Studio CLI (lms), use `node-llama-cpp`, or `ollama` binaries. The app should span the engine on startup and kill it on quit.

## 3. Sandboxing: Docker vs. Windows Sandbox
- **The Issue**: Sprint 5 targets tool sandboxing using Docker in WSL2. 
- **The Risk**: Docker Desktop requires a paid license for enterprise use. WSL2 requires hardware virtualization enabled in BIOS, which IT sometimes disables.
- **The Improvement**: Since this is a Windows-first application, Native **Windows Sandbox** (`.wsb` files) might be a more enterprise-friendly fallback or primary solution than Docker, as it's built into Windows 10/11 Pro/Enterprise by default and requires less third-party licensing.

## 4. Microsoft Graph Authentication (Unclear Reference)
- **The Issue**: `plan.md` mentions using `@azure/identity`'s `DefaultAzureCredential` for Entra ID/SSO.
- **The Clarification**: `DefaultAzureCredential` is typically for server-to-server or developer environment auth. For a desktop app acting on behalf of a user, you must use **MSAL Node** (Microsoft Authentication Library) with the **Interactive Browser Flow** or **Device Code Flow**. The Azure App Registration must be configured as a "Public client/native application", and consent scopes (e.g., `Calendars.Read`) must be granted interactively by the user.

## 5. SQLite Encryption Strategy
- **The Issue**: `plan.md` T009 specifies a custom wrapper using `crypto` (AES-256-GCM) for transparent SQLite encryption.
- **The Risk**: App-layer encryption means you encrypt individual columns/payloads. While secure, this makes **full-text SQL search** over chat history impossible (since the DB engine only sees ciphertexts). 
- **The Improvement**: If searching conversation history is important, consider using **SQLCipher** (encrypts the whole SQLite database file seamlessly). Note: SQLCipher requires a native C++ build step with Node-gyp, which can complicate the Electron build process, so weigh the trade-off between searchability and build complexity carefully.

## 6. Sprint Parallelism
- **The Opportunity**: `tasks.md` correctly identifies that US1, US2, and US3 can run independently once the Phase 2 Foundational tasks are done. However, `sprint-plan.md` schedules Sprints 3, 4, and 5 strictly sequentially. If you are leveraging AI agents (like myself) or multiple developers, you could parallelize Sprints 3, 4, and 5 to accelerate the timeline significantly.
