import { NextRequest, NextResponse } from 'next/server';
import { Task, CreateTaskRequest, ApiResponse } from '@/lib/types';

// In-memory storage for tasks (in production, use a database)
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

// GET /api/tasks - List all tasks
export async function GET() {
  try {
    const response: ApiResponse<Task[]> = {
      success: true,
      data: tasks,
      message: `Retrieved ${tasks.length} tasks`
    };
    
    return NextResponse.json(response);
  } catch (error) {
    const errorResponse: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve tasks'
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// POST /api/tasks - Create new task
export async function POST(request: NextRequest) {
  try {
    const body: CreateTaskRequest = await request.json();
    
    if (!body.title || !body.description) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Title and description are required'
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: body.title,
      description: body.description,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    tasks.push(newTask);

    const response: ApiResponse<Task> = {
      success: true,
      data: newTask,
      message: 'Task created successfully'
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    const errorResponse: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create task'
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}