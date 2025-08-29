import { NextRequest, NextResponse } from 'next/server';
import { Task, UpdateTaskRequest, ApiResponse } from '@/lib/types';

// Note: In a real application, this would be shared state or database
// For this demo, we'll simulate accessing the same task storage
let tasks: Task[] = [
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

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/tasks/[id] - Get specific task
export async function GET(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  try {
    const task = tasks.find(t => t.id === params.id);
    
    if (!task) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Task not found'
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    const response: ApiResponse<Task> = {
      success: true,
      data: task,
      message: 'Task retrieved successfully'
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorResponse: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve task'
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// PUT /api/tasks/[id] - Update task
export async function PUT(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  try {
    const taskIndex = tasks.findIndex(t => t.id === params.id);
    
    if (taskIndex === -1) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Task not found'
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    const body: UpdateTaskRequest = await request.json();
    const existingTask = tasks[taskIndex];

    const updatedTask: Task = {
      ...existingTask,
      title: body.title ?? existingTask.title,
      description: body.description ?? existingTask.description,
      completed: body.completed ?? existingTask.completed,
      updatedAt: new Date()
    };

    tasks[taskIndex] = updatedTask;

    const response: ApiResponse<Task> = {
      success: true,
      data: updatedTask,
      message: 'Task updated successfully'
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorResponse: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update task'
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// DELETE /api/tasks/[id] - Delete task
export async function DELETE(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  try {
    const taskIndex = tasks.findIndex(t => t.id === params.id);
    
    if (taskIndex === -1) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Task not found'
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    const deletedTask = tasks[taskIndex];
    tasks.splice(taskIndex, 1);

    const response: ApiResponse<Task> = {
      success: true,
      data: deletedTask,
      message: 'Task deleted successfully'
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorResponse: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete task'
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}