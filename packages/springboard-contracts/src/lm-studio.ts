/**
 * LM Studio API - OpenAI-compatible chat completions
 */

export interface LMStudioMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  name?: string;
}

export interface LMStudioChatRequest {
  model?: string;
  messages: LMStudioMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
}

export interface LMStudioChatResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: LMStudioMessage;
    finish_reason: 'stop' | 'length' | 'error';
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface LMStudioModel {
  id: string;
  object: 'model';
  created: number;
  owned_by: string;
}

export interface LMStudioModelsResponse {
  object: 'list';
  data: LMStudioModel[];
}
