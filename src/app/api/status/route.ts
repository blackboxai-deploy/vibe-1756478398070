import { NextResponse } from 'next/server';
import { ServerStatus, ApiResponse } from '@/lib/types';

let startTime = Date.now();

export async function GET() {
  try {
    const uptime = Date.now() - startTime;
    
    // Get memory usage
    const memoryUsage = process.memoryUsage();
    
    const status: ServerStatus = {
      httpApi: {
        status: 'running',
        port: 3000,
        uptime: uptime
      },
      mcpServer: {
        status: 'running', // TODO: Get actual MCP server status
        connections: 0, // TODO: Get actual connection count
        tools: [
          'list_tasks',
          'create_task', 
          'update_task',
          'delete_task',
          'read_file',
          'list_files',
          'system_info'
        ]
      },
      system: {
        memory: {
          used: memoryUsage.heapUsed,
          total: memoryUsage.heapTotal
        },
        cpu: {
          usage: 0 // TODO: Get actual CPU usage
        }
      }
    };

    const response: ApiResponse<ServerStatus> = {
      success: true,
      data: status,
      message: 'Server status retrieved successfully'
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorResponse: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}