/**
 * Sandbox API - Docker container execution
 */

export interface SandboxStartRequest {
  image?: string; // Docker image (default: alpine:latest)
  command?: string[]; // Command to execute
  workdir?: string; // Working directory
  env?: Record<string, string>; // Environment variables
  volumes?: Array<{
    hostPath: string;
    containerPath: string;
    readOnly?: boolean;
  }>;
  timeout?: number; // Execution timeout in seconds
  memoryLimit?: string; // e.g., '512m', '1g'
  cpuLimit?: number; // CPU limit (0.5 = 50%)
}

export interface SandboxStartResponse {
  containerId: string;
  status: 'starting' | 'running';
}

export interface SandboxExecRequest {
  containerId: string;
  command: string[];
  workdir?: string;
  env?: Record<string, string>;
  timeout?: number;
}

export interface SandboxExecResponse {
  exitCode: number;
  stdout: string;
  stderr: string;
  duration: number; // milliseconds
  timedOut: boolean;
}

export interface SandboxStopRequest {
  containerId: string;
  signal?: 'SIGTERM' | 'SIGKILL';
  timeout?: number;
}

export interface SandboxStopResponse {
  containerId: string;
  status: 'stopped' | 'killed';
}

export interface SandboxStatusRequest {
  containerId: string;
}

export interface SandboxStatusResponse {
  containerId: string;
  status: 'running' | 'stopped' | 'exited' | 'error';
  uptime?: number; // seconds
  memoryUsage?: number; // bytes
  cpuUsage?: number; // percentage
}
