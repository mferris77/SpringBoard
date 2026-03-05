const fs = require('fs');
const path = require('path');

const baseDir1 = String.raw`c:\DEV\AI\SpringBoard\specs`;
const baseDir2 = String.raw`c:\DEV\AI\SpringBoard`;

const replacements = [
    // General architecture & LM Studio
    [/(Node\.js \(Express\/Fastify\))|(Express\/Fastify)/gi, 'Node.js (Electron Main process)'],
    [/LM Studio bridge/gi, 'Azure OpenAI / AI Inference Engine bridge'],
    [/LM Studio HTTP API/gi, 'Azure OpenAI / Local fallback HTTP API'],
    [/LM Studio on NVIDIA 4090 for local inference; future hybrid cloud toggle for larger models/gi, 'Azure OpenAI primarily, with support for local OpenAI-compatible inference endpoints'],
    [/LM Studio local-only/gi, 'Local fallback inference'],
    [/LM Studio unauthorized/gi, 'Untrusted LLM engine'],
    [/LM Studio local/gi, 'local inference'],
    [/LM Studio GUI/gi, 'local inference engine'],
    [/LM Studio/gi, 'Azure OpenAI / Inference Engine'],
    [/localhost:3000\/api\/(\w+)/gi, 'IPC channel $1'],
    [/localhost:3000/g, 'Electron Main IPC'],
    [/localhost:8000/g, 'inference endpoint'],
    [/HTTP API integration/gi, 'API integration'],
    [/Express/g, 'Electron IPC'],

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
    [/WSL2/gi, 'Windows Sandbox (WSB)'],
    [/Docker/gi, 'Windows Sandbox (WSB)'],
    [/WSB\/Windows Sandbox \(WSB\)/gi, 'Windows Sandbox (WSB)'],

    // Auth
    [/@azure\/identity \(DefaultAzureCredential for Entra ID\/SSO\)/g, '@azure/msal-node (Interactive Browser Flow / Device Code Flow for Entra ID/SSO)'],
    [/DefaultAzureCredential/gi, 'MSAL Node'],
    [/Azure AD/gi, 'Entra ID (MSAL)'],

    // SQL & Storage
    [/Encrypted SQLite wrapper/gi, 'SQLCipher wrapper'],
    [/encrypted SQLite library wrapper/gi, 'SQLCipher wrapper'],
    [/encrypted SQLite wrapper/gi, 'SQLCipher wrapper'],
    [/better-sqlite3 or nedb/gi, 'SQLCipher with sqlite-vec'],
    [/better-sqlite3/gi, 'SQLCipher/better-sqlite3-multiple-ciphers'],
    [/Encrypted SQLite\/NeDB/gi, 'SQLCipher / sqlite-vec'],
    [/Encrypted SQLite/gi, 'SQLCipher'],
    [/encrypted SQLite/gi, 'SQLCipher'],
    [/SQLite encrypted database/gi, 'SQLCipher encrypted database'],
    [/SQLite/g, 'SQLCipher'],

    // IPC vs REST
    [/REST API \+ WebSocket for chat/gi, 'IPC bridge for chat'],
    [/GET \/api\//gi, 'IPC message: '],
    [/POST \/api\//gi, 'IPC message: '],
    [/DELETE \/api\//gi, 'IPC message: '],
    [/PATCH \/api\//gi, 'IPC message: '],
    [/Axios wrapper for backend API calls/gi, 'IPC wrapper for backend calls'],
    [/Endpoint: `POST \/api\/chat`/gi, 'Channel: `ipc:chat`'],
    [/http:\/\/localhost:3000\/api\//gi, 'via IPC: ']
];

function patchFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf-8');
    for (const [regex, replacement] of replacements) {
        content = content.replace(regex, replacement);
    }
    fs.writeFileSync(filepath, content, 'utf-8');
}

function walkDir(dir, recursive = true) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory() && recursive && !fullPath.includes('.git') && !fullPath.includes('node_modules')) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.md') && !fullPath.includes('review_findings.md')) {
            console.log(`Patching ${fullPath}...`);
            try {
                patchFile(fullPath);
            } catch (e) {
                console.error("Failed to patch", fullPath, e.message);
            }
        }
    });
}

walkDir(baseDir1);
// Walk root but not recursively so we don't double dip specs, but get README and DEVELOPMENT
fs.readdirSync(baseDir2).forEach(file => {
    let fullPath = path.join(baseDir2, file);
    if (!fs.statSync(fullPath).isDirectory() && fullPath.endsWith('.md')) {
        console.log(`Patching ${fullPath}...`);
        try {
            patchFile(fullPath);
        } catch (e) {
            console.error("Failed to patch", fullPath, e.message);
        }
    }
});

console.log("Patching complete across all md files.");
