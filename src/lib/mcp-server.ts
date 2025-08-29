import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { Task, McpResponse } from './types';

// In-memory task storage (shared with HTTP API in production)
let mcpTasks: Task[] = [
  {
    id: '1',
    title: 'Setup API Server',
    description: 'Create HTTP API endpoints for task management',
    completed: true,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z')
  },
  {
    id: '2',
    title: 'Implement MCP Server',
    description: 'Create MCP server with WebSocket support',
    completed: false,
    createdAt: new Date('2024-01-15T11:00:00Z'),
    updatedAt: new Date('2024-01-15T11:00:00Z')
  }
];

export class MCPTaskServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'task-manager-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'list_tasks',
            description: 'Get all tasks from the task manager',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'create_task',
            description: 'Create a new task',
            inputSchema: {
              type: 'object',
              properties: {
                title: { type: 'string', description: 'Task title' },
                description: { type: 'string', description: 'Task description' },
              },
              required: ['title', 'description'],
            },
          },
          {
            name: 'update_task',
            description: 'Update an existing task',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Task ID' },
                title: { type: 'string', description: 'Task title' },
                description: { type: 'string', description: 'Task description' },
                completed: { type: 'boolean', description: 'Task completion status' },
              },
              required: ['id'],
            },
          },
          {
            name: 'delete_task',
            description: 'Delete a task',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Task ID' },
              },
              required: ['id'],
            },
          },
          {
            name: 'read_file',
            description: 'Read contents of a file',
            inputSchema: {
              type: 'object',
              properties: {
                path: { type: 'string', description: 'File path to read' },
              },
              required: ['path'],
            },
          },
          {
            name: 'list_files',
            description: 'List files in the workspace',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'system_info',
            description: 'Get system information',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      const parameters = args || {};

      try {
        switch (name) {
          case 'list_tasks':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(mcpTasks, null, 2),
                },
              ],
            };

          case 'create_task':
            const newTask: Task = {
              id: Date.now().toString(),
              title: (parameters.title as string) || '',
              description: (parameters.description as string) || '',
              completed: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            mcpTasks.push(newTask);
            return {
              content: [
                {
                  type: 'text',
                  text: `Task created successfully: ${JSON.stringify(newTask, null, 2)}`,
                },
              ],
            };

          case 'update_task':
            const taskIndex = mcpTasks.findIndex(t => t.id === (parameters.id as string));
            if (taskIndex === -1) {
              throw new Error('Task not found');
            }
            
            const existingTask = mcpTasks[taskIndex];
            const updatedTask: Task = {
              ...existingTask,
              title: (parameters.title as string) ?? existingTask.title,
              description: (parameters.description as string) ?? existingTask.description,
              completed: (parameters.completed as boolean) ?? existingTask.completed,
              updatedAt: new Date(),
            };
            mcpTasks[taskIndex] = updatedTask;
            
            return {
              content: [
                {
                  type: 'text',
                  text: `Task updated successfully: ${JSON.stringify(updatedTask, null, 2)}`,
                },
              ],
            };

          case 'delete_task':
            const deleteIndex = mcpTasks.findIndex(t => t.id === (parameters.id as string));
            if (deleteIndex === -1) {
              throw new Error('Task not found');
            }
            
            const deletedTask = mcpTasks.splice(deleteIndex, 1)[0];
            return {
              content: [
                {
                  type: 'text',
                  text: `Task deleted successfully: ${JSON.stringify(deletedTask, null, 2)}`,
                },
              ],
            };

          case 'read_file':
            try {
              const fs = await import('fs/promises');
              const path = await import('path');
              const fullPath = path.join(process.cwd(), (parameters.path as string) || '');
              const content = await fs.readFile(fullPath, 'utf-8');
              return {
                content: [
                  {
                    type: 'text',
                    text: `File content for ${parameters.path}:\n\n${content}`,
                  },
                ],
              };
            } catch (error) {
              throw new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }

          case 'list_files':
            try {
              const fs = await import('fs/promises');
              const entries = await fs.readdir(process.cwd());
              const filteredEntries = entries.filter(entry => 
                !['node_modules', '.next', '.git', 'dist', 'build'].includes(entry)
              );
              return {
                content: [
                  {
                    type: 'text',
                    text: `Files in workspace:\n${filteredEntries.join('\n')}`,
                  },
                ],
              };
            } catch (error) {
              throw new Error(`Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }

          case 'system_info':
            const memoryUsage = process.memoryUsage();
            const systemInfo = {
              platform: process.platform,
              nodeVersion: process.version,
              memory: {
                used: memoryUsage.heapUsed,
                total: memoryUsage.heapTotal,
                external: memoryUsage.external,
              },
              uptime: process.uptime(),
            };
            return {
              content: [
                {
                  type: 'text',
                  text: `System Information:\n${JSON.stringify(systemInfo, null, 2)}`,
                },
              ],
            };

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        throw new Error(`Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('MCP Task Server started');
  }
}

// Export for use in API routes or standalone execution
export default MCPTaskServer;