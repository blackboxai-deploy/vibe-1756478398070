// Task Management Types
export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  completed?: boolean;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ServerStatus {
  httpApi: {
    status: 'running' | 'stopped';
    port: number;
    uptime: number;
  };
  mcpServer: {
    status: 'running' | 'stopped';
    connections: number;
    tools: string[];
  };
  system: {
    memory: {
      used: number;
      total: number;
    };
    cpu: {
      usage: number;
    };
  };
}

// File Operations Types
export interface FileInfo {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modified?: Date;
}

export interface ReadFileRequest {
  path: string;
}

export interface ReadFileResponse {
  content: string;
  path: string;
  size: number;
}

// MCP Protocol Types
export interface McpTool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface McpRequest {
  tool: string;
  parameters: Record<string, any>;
}

export interface McpResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// WebSocket Message Types
export interface WebSocketMessage {
  type: 'tool_call' | 'tool_response' | 'status' | 'error';
  id: string;
  payload: any;
}

// Connection Status Types
export interface ConnectionStatus {
  connected: boolean;
  lastSeen?: Date;
  error?: string;
}