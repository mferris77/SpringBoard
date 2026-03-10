# Azure OpenAI / Local fallback HTTP API Contract

**Version**: 1.0.0 | **Last Updated**: March 3, 2026
**Purpose**: Specification for Azure OpenAI / Inference Engine inference API integration (local models)

---

## Overview

Azure OpenAI / Inference Engine runs locally on NVIDIA RTX 4090 with HTTP server on `http://inference endpoint`. SpringBoard Node backend communicates with Azure OpenAI / Inference Engine to generate chat responses using local open-source models.

**Supported Models**:
- Mistral 7B (7B parameters, ~17GB VRAM, fast)
- Llama 2 70B (70B parameters, ~45GB VRAM, high quality)
- Phi 3 (3.8B parameters, ~8GB VRAM, lightweight)

---

## HTTP API Endpoints

### 1. List Available Models
```
GET http://inference endpoint/api/models
```

**Response 200**:
```json
{
  "data": [
    {
      "id": "mistral-7b",
      "object": "model",
      "created": 1677600000,
      "owned_by": "mistral-ai",
      "permission": [],
      "root": "mistral-7b",
      "parent": null
    },
    {
      "id": "llama-2-70b",
      "object": "model",
      "created": 1681000000,
      "owned_by": "meta",
      "permission": [],
      "root": "llama-2-70b",
      "parent": null
    }
  ]
}
```

---

### 2. Chat Completion (OpenAI Compatible)
```
POST http://inference endpoint/v1/chat/completions
```

**Request**:
```json
{
  "model": "mistral-7b",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful workplace assistant. All conversation data is stored locally on the user's machine. You have access to Office integration and can help with calendars, emails, and documents when permissions are granted."
    },
    {
      "role": "user",
      "content": "What meetings do I have tomorrow?"
    },
    {
      "role": "assistant",
      "content": "I'd need permission to check your Outlook calendar. Would you like to grant that access?"
    },
    {
      "role": "user",
      "content": "Yes, check my calendar."
    }
  ],
  "temperature": 0.7,
  "max_tokens": 500,
  "top_p": 0.95,
  "frequency_penalty": 0,
  "presence_penalty": 0,
  "stream": false
}
```

**Response 200 (Non-streaming)**:
```json
{
  "id": "chatcmpl-1234567890",
  "object": "text_completion",
  "created": 1677649342,
  "model": "mistral-7b",
  "usage": {
    "prompt_tokens": 45,
    "completion_tokens": 120,
    "total_tokens": 165
  },
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "You have the following meetings tomorrow:\n\n1. Team Standup: 10:00 AM - 10:30 AM\n2. Project Review: 2:00 PM - 3:00 PM\n3. 1:1 with Manager: 4:00 PM - 4:30 PM\n\nWould you like me to provide more details about any of these?"
      },
      "finish_reason": "stop",
      "index": 0
    }
  ]
}
```

**Response (Streaming)**:
```
POST /v1/chat/completions with "stream": true
```

Server-Sent Events (SSE) format:
```
data: {"id":"chatcmpl-123","object":"text_completion.chunk","created":1677649342,"model":"mistral-7b","choices":[{"delta":{"role":"assistant","content":"You"},"finish_reason":null,"index":0}]}

data: {"id":"chatcmpl-123","object":"text_completion.chunk","created":1677649342,"model":"mistral-7b","choices":[{"delta":{"content":" have"},"finish_reason":null,"index":0}]}

...

data: [DONE]
```

---

### 3. Token Count (Optional)
```
POST http://inference endpoint/v1/completions
```

Used to estimate token count before sending request (helps manage context window).

**Request**:
```json
{
  "model": "mistral-7b",
  "prompt": "What is the capital of France?",
  "max_tokens": 0  // Don't generate, just count tokens
}
```

**Response 200**:
```json
{
  "usage": {
    "prompt_tokens": 11,
    "completion_tokens": 0,
    "total_tokens": 11
  }
}
```

---

## Error Handling

### Response 400 (Bad Request)
```json
{
  "error": {
    "message": "Invalid request: model parameter is required",
    "type": "invalid_request_error",
    "param": "model",
    "code": "missing_required_parameter"
  }
}
```

### Response 404 (Model Not Found)
```json
{
  "error": {
    "message": "Model 'gpt-4' not found. Available models: [mistral-7b, llama-2-70b]",
    "type": "not_found_error",
    "param": "model",
    "code": "model_not_found"
  }
}
```

### Response 503 (Service Unavailable)
```json
{
  "error": {
    "message": "Azure OpenAI / Inference Engine server is not responding. Ensure Azure OpenAI / Inference Engine is running on inference endpoint",
    "type": "server_error",
    "code": "service_unavailable"
  }
}
```

---

## TypeScript Client Integration

```typescript
// src/services/llm-service.ts

import axios, { AxiosInstance } from "axios";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  top_k?: number;
  stream?: boolean;
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    message: { role: string; content: string };
    finish_reason: "stop" | "length" | "error";
    index: number;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class LMStudioService {
  private client: AxiosInstance;
  private baseURL: string = "http://inference endpoint";
  private defaultModel: string = "mistral-7b";

  constructor(baseURL?: string) {
    if (baseURL) this.baseURL = baseURL;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 60000, // 60s timeout for inference
    });
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await this.client.get("/api/models");
      return response.data.data.map((m: any) => m.id);
    } catch (error) {
      throw new Error(`Failed to list models: ${(error as Error).message}`);
    }
  }

  async chat(
    messages: Message[],
    options?: Partial<ChatCompletionRequest>
  ): Promise<ChatCompletionResponse> {
    const request: ChatCompletionRequest = {
      model: this.defaultModel,
      messages,
      temperature: 0.7,
      max_tokens: 500,
      top_p: 0.95,
      stream: false,
      ...options,
    };

    try {
      const response = await this.client.post(
        "/v1/chat/completions",
        request
      );
      return response.data as ChatCompletionResponse;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNREFUSED") {
          throw new Error(
            "Azure OpenAI / Inference Engine server not accessible at " + this.baseURL
          );
        }
      }
      throw error;
    }
  }

  async chatStream(
    messages: Message[],
    options?: Partial<ChatCompletionRequest>
  ): Promise<AsyncGenerator<string, void, unknown>> {
    const request: ChatCompletionRequest = {
      model: this.defaultModel,
      messages,
      temperature: 0.7,
      max_tokens: 500,
      stream: true,
      ...options,
    };

    return this.client
      .post("/v1/chat/completions", request, {
        responseType: "stream",
      })
      .then((response) =>
        this.parseStreamResponse(response.data)
      );
  }

  private async *parseStreamResponse(stream: any): AsyncGenerator<string> {
    const rl = require("readline").createInterface({ input: stream });

    for await (const line of rl) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") break;

        try {
          const json = JSON.parse(data);
          const content = json.choices[0]?.delta?.content;
          if (content) yield content;
        } catch (e) {
          // Skip malformed JSON lines
        }
      }
    }
  }

  setDefaultModel(model: string): void {
    this.defaultModel = model;
  }
}
```

---

## Integration Testing

### Mock Azure OpenAI / Inference Engine Server (Tests)
```typescript
// test/contract/lm-studio.mock.ts

import Electron IPC from "express";

export function createMockLMStudio(): Electron IPC.Application {
  const app = Electron IPC();
  app.use(Electron IPC.json());

  app.get("/api/models", (req, res) => {
    res.json({
      data: [
        { id: "mistral-7b", object: "model", created: 1677600000 },
        { id: "llama-2-70b", object: "model", created: 1681000000 },
      ],
    });
  });

  app.post("/v1/chat/completions", (req, res) => {
    const { messages, stream } = req.body;

    if (!messages || messages.length === 0) {
      return res.status(400).json({
        error: {
          message: "Invalid request: messages are required",
          type: "invalid_request_error",
        },
      });
    }

    const mockResponse = {
      id: "chatcmpl-" + Math.random().toString(36).substring(7),
      object: "text_completion",
      created: Math.floor(Date.now() / 1000),
      model: req.body.model || "mistral-7b",
      choices: [
        {
          message: {
            role: "assistant",
            content:
              "This is a mock response from Azure OpenAI / Inference Engine mock server.",
          },
          finish_reason: "stop",
          index: 0,
        },
      ],
      usage: {
        prompt_tokens: 45,
        completion_tokens: 12,
        total_tokens: 57,
      },
    };

    if (stream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.write(
        `data: ${JSON.stringify({
          ...mockResponse.choices[0].message,
          ...mockResponse.choices[0],
        })}\n\n`
      );
      res.write("data: [DONE]\n\n");
      res.end();
    } else {
      res.json(mockResponse);
    }
  });

  return app;
}
```

### Unit Test Example
```typescript
// test/unit/llm-service.test.ts

import { LMStudioService } from "../../src/services/llm-service";
import { createMockLMStudio } from "../contract/lm-studio.mock";

describe("LMStudioService", () => {
  let service: LMStudioService;
  let mockServer: any;

  beforeAll((done) => {
    mockServer = createMockLMStudio().listen(9999, done);
    service = new LMStudioService("http://localhost:9999");
  });

  afterAll((done) => {
    mockServer.close(done);
  });

  it("should list available models", async () => {
    const models = await service.listModels();
    expect(models).toContain("mistral-7b");
    expect(models).toContain("llama-2-70b");
  });

  it("should complete chat request", async () => {
    const response = await service.chat([
      { role: "user", content: "Hello" },
    ]);
    expect(response.choices[0].message.content).toBeDefined();
    expect(response.usage.total_tokens).toBeGreaterThan(0);
  });

  it("should throw error if server unavailable", async () => {
    const badService = new LMStudioService(
      "http://localhost:8888"
    );
    await expect(
      badService.chat([{ role: "user", content: "Hello" }])
    ).rejects.toThrow("Azure OpenAI / Inference Engine server not accessible");
  });
});
```

---

## Deployment & Configuration

### Windows Installation
1. Download Azure OpenAI / Inference Engine from https://lmstudio.ai
2. Install and launch Azure OpenAI / Inference Engine
3. Download a model (e.g., Mistral 7B)
4. Start server: Settings → Server → Start Server on :8000
5. Verify: `curl http://inference endpoint/api/models`

### SpringBoard Configuration (SOUL.md)
```yaml
# SOUL.md
llm:
  provider: lm_studio
  base_url: http://inference endpoint
  model: mistral-7b
  temperature: 0.7
  max_tokens: 500
  timeout_seconds: 60
  fallback_mode: local_only  # fail if Azure OpenAI / Inference Engine unavailable
```

### Handling Azure OpenAI / Inference Engine Unavailable
```
1. User opens SpringBoard
2. Backend attempts to connect to Azure OpenAI / Inference Engine
   ├─ Success → Chat enabled
   └─ Failure → Show banner "Azure OpenAI / Inference Engine not running"
       ├─ Hybrid mode enabled? → Fall back to Azure OpenAI (offer switch)
       └─ Hybrid mode disabled → Disable chat, show setup instructions
```

---

## Performance Tuning

**Latency Targets**:
| Model | VRAM | Tokens/Sec | Time for 100 Tokens | Target |
|-------|------|-----------|------|--------|
| Mistral 7B | 17 GB | 12 | 8.3s | < 10s ✅ |
| Llama 2 70B | 45 GB | 8 | 12.5s | < 15s ⚠️ |
| Phi 3 | 8 GB | 20 | 5s | < 5s ✅ |

**Optimization**:
- For sub-2s response goal: Use Mistral 7B or Phi 3 (not Llama 70B)
- Context length: 4K tokens (sufficient for chat + brief context)
- Batch size: 1 (single user, real-time interaction)

---

## Token Limits & Context Window

**Mistral 7B**: 32K context window
- System prompt: ~50 tokens
- Conversation history: ~3000 tokens (typical)
- User message: ~100 tokens
- Available for completion: ~29K tokens

**Strategy**:
- If conversation exceeds 4K tokens, summarize oldest messages
- Audit log: Track token usage per conversation
- User notification: If approaching limit, offer to archive conversation

---

## Future Hybrid Mode (Phase 2+)

When hybrid cloud toggle is enabled, LLM service can fall back to Azure OpenAI.

```typescript
// Future implementation
interface LMConfig {
  provider: "lm_studio" | "azure_openai";
  storage: Message[]; // always local
  inference: "local_only" | "cloud_optional" | "cloud_preferred";
}

if (config.inference === "cloud_optional") {
  try {
    response = await lmService.chat(messages); // Azure OpenAI / Inference Engine
  } catch {
    if (config.provider === "hybrid") {
      console.warn("Azure OpenAI / Inference Engine failed; falling back to Azure OpenAI");
      response = await azureService.chat(messages); // Azure
      auditLog.info("llm_fallback_to_cloud", { reason: "local_unavailable" });
    }
  }
}
```

---

**Next Step**: Implement Windows Sandbox API contract for sandbox tool execution.
