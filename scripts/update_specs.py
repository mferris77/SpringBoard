import os
import re

base_dir = r"c:\DEV\AI\SpringBoard\specs\001-local-ai-assistant"

def patch_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for r in replacements:
        content = re.sub(r[0], r[1], content, flags=re.IGNORECASE)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

replacements = [
    # General architecture & LM Studio
    (r'Node\.js \(Express/Fastify\)', 'Node.js (Electron Main process)'),
    (r'Express/Fastify', 'Electron Main process / IPC'),
    (r'LM Studio bridge', 'Azure OpenAI / AI Inference Engine bridge'),
    (r'LM Studio HTTP API', 'Azure OpenAI / Local fallback HTTP API'),
    (r'LM Studio on NVIDIA 4090 for local inference; future hybrid cloud toggle for larger models', 'Azure OpenAI primarily, with support for local OpenAI-compatible inference endpoints'),
    (r'LM Studio local', 'local inference'),
    (r'LM Studio', 'Azure OpenAI / AI Inference Engine'),
    (r'localhost:3000/api/(\w+)', r'IPC channel \1'),
    (r'localhost:3000', 'Electron Main IPC'),
    (r'localhost:8000', 'inference endpoint'),
    (r'HTTP API integration', 'API integration'),
    
    # Sandboxing & Docker
    (r'WSL2 \+ Docker container isolation', 'Windows Sandbox (WSB) isolation'),
    (r'WSL2 \+ Docker container', 'Windows Sandbox (WSB)'),
    (r'WSL2 \+ Docker', 'Windows Sandbox (WSB)'),
    (r'Docker container', 'Windows Sandbox'),
    (r'Docker executor', 'Windows Sandbox Executor'),
    (r'docker-api', 'sandbox-api'),
    (r'dockerode', 'Windows Sandbox COM/PowerShell API'),
    (r'WSL2 sandbox', 'Windows Sandbox'),
    (r'WSL2/Docker', 'Windows Sandbox (WSB)'),
    (r'Docker API contract', 'Windows Sandbox API contract'),
    (r'Docker Desktop', 'Windows Sandbox'),
    (r'WSL2', 'Windows Sandbox (WSB)'),
    (r'Docker', 'Windows Sandbox (WSB)'),
    
    # Auth
    (r'@azure/identity \(DefaultAzureCredential for Entra ID/SSO\)', '@azure/msal-node (Interactive Browser Flow / Device Code Flow for Entra ID/SSO)'),
    (r'DefaultAzureCredential', 'MSAL Node'),
    
    # SQL & Storage
    (r'Encrypted SQLite wrapper', 'SQLCipher wrapper'),
    (r'encrypted SQLite library wrapper', 'SQLCipher wrapper'),
    (r'encrypted SQLite wrapper', 'SQLCipher wrapper'),
    (r'better-sqlite3 or nedb', 'SQLCipher with sqlite-vec'),
    (r'better-sqlite3', 'SQLCipher/better-sqlite3-multiple-ciphers'),
    (r'Encrypted SQLite/NeDB', 'SQLCipher / sqlite-vec'),
    (r'Encrypted SQLite', 'SQLCipher'),
    (r'encrypted SQLite', 'SQLCipher'),
    
    # IPC vs REST
    (r'REST API \+ WebSocket for chat', 'IPC bridge for chat'),
    (r'GET /api/', 'IPC message: '),
    (r'POST /api/', 'IPC message: '),
    (r'DELETE /api/', 'IPC message: '),
    (r'PATCH /api/', 'IPC message: '),
    (r'Axios wrapper for backend API calls', 'IPC wrapper for backend calls'),
    (r'Endpoint: `POST /api/chat`', 'Channel: `ipc:chat`'),
    (r'http://localhost:3000/api/', 'via IPC: '),
    
    # Sprint plan parallelism
    (r'Sprint 3 must complete before Sprint 4-7.*', 'Sprints 3, 4, and 5 can be executed in parallel once Phase 2 is complete.'),
    (r'Sequential implementation of Sprints 3-5', 'Parallel implementation of Sprints 3, 4, and 5'),
]

for filename in ['plan.md', 'sprint-plan.md', 'tasks.md', 'spec.md']: # include spec.md just in case for missed ones
    filepath = os.path.join(base_dir, filename)
    print(f"Patching {filepath}...")
    patch_file(filepath, replacements)

print("Patching complete.")

