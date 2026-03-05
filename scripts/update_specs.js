const fs = require('fs');
const path = require('path');

const baseDir = String.raw`c:\DEV\AI\SpringBoard\specs\001-local-ai-assistant`;

const replacements = [
    // General architecture & LM Studio
    [/(Node\.js \(Express\/Fastify)\)|(Express\/Fastify)/gi, 'Node.js (Electron Main process)'],
    [/LM Studio bridge/gi, 'Azure OpenAI / AI Inference Engine bridge'],
    [/LM Studio HTTP API/gi, 'Azure OpenAI / Local fallback HTTP API'],
    [/LM Studio on NVIDIA 4090 for local inference; future hybrid cloud toggle for larger models/gi, 'Azure OpenAI primarily, with support for local OpenAI-compatible inference endpoints'],
    [/LM Studio local/gi, 'local inference'],
    [/LM Studio/g, 'Azure OpenAI / AI Inference Engine'],
    [/localhost:3000\/api\/(\w+)/gi, 'IPC channel $1'],
    [/localhost:3000/g, 'Electron Main IPC'],
    [/localhost:8000/g, 'inference endpoint'],
    [/HTTP API integration/gi, 'API integration'],
    
    // Sandboxing & Docker
    [/WSL2 \+ Docker container isolation/gi, 'Windows Sandbox (WSB) isolation'],
    [/WSL2 \+ Docker container/gi, 'Windows Sandbox (WSB)'],
    [/WSL2 \+ Docker/gi, 'Windows Sandbox (WSB)'],
    [/Docker container/gi, 'Windows Sandbox'],
    [/Docker executor/gi, 'Windows Sandbox Executor'],
    [/docker-api/gi, 'sandbox-api'],
    [/dockerode/gi, 'Windows Sandbox COM/PowerShell API'],
    [/WSL2 sandbox/gi, 'Windows Sandbox'],
    [/WSL2\/Docker/gi, 'Windows Sandbox (WSB)'],
    [/Docker API contract/gi, 'Windows Sandbox API contract'],
    [/Docker Desktop/gi, 'Windows Sandbox'],
    [/WSL2/g, 'Windows Sandbox (WSB)'],
    [/Docker/g, 'Windows Sandbox (WSB)'],
    
    // Auth
    [/@azure\/identity \(DefaultAzureCredential for Entra ID\/SSO\)/g, '@azure/msal-node (Interactive Browser Flow / Device Code Flow for Entra ID/SSO)'],
    [/DefaultAzureCredential/g, 'MSAL Node'],
    
    // SQL & Storage
    [/Encrypted SQLite wrapper/gi, 'SQLCipher wrapper'],
    [/encrypted SQLite library wrapper/gi, 'SQLCipher wrapper'],
    [/encrypted SQLite wrapper/gi, 'SQLCipher wrapper'],
    [/better-sqlite3 or nedb/gi, 'SQLCipher with sqlite-vec'],
    [/better-sqlite3/g, 'SQLCipher/better-sqlite3-multiple-ciphers'],
    [/Encrypted SQLite\/NeDB/gi, 'SQLCipher / sqlite-vec'],
    [/Encrypted SQLite/gi, 'SQLCipher'],
    [/encrypted SQLite/gi, 'SQLCipher'],
    
    // IPC vs REST
    [/REST API \+ WebSocket for chat/gi, 'IPC bridge for chat'],
    [/GET \/api\//gi, 'IPC message: '],
    [/POST \/api\//gi, 'IPC message: '],
    [/DELETE \/api\//gi, 'IPC message: '],
    [/PATCH \/api\//gi, 'IPC message: '],
    [/Axios wrapper for backend API calls/gi, 'IPC wrapper for backend calls'],
    [/Endpoint: `POST \/api\/chat`/g, 'Channel: `ipc:chat`'],
    [/http:\/\/localhost:3000\/api\//g, 'via IPC: '],
    
    // Sprint plan parallelism
    [/Sprint 3 must complete before Sprint 4-7.*/g, 'Sprints 3, 4, and 5 can be executed in parallel once Phase 2 is complete.'],
    [/Sequential implementation of Sprints 3-5/gi, 'Parallel implementation of Sprints 3, 4, and 5']
];

function patchFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf-8');
    for (const [regex, replacement] of replacements) {
        content = content.replace(regex, replacement);
    }
    fs.writeFileSync(filepath, content, 'utf-8');
}

['plan.md', 'sprint-plan.md', 'tasks.md', 'spec.md'].forEach(filename => {
    const p = path.join(baseDir, filename);
    console.log(`Patching ${p}...`);
    try {
        patchFile(p);
    } catch(e) {
        console.error("Failed to patch", p, e.message);
    }
});
console.log("Patching complete.");
