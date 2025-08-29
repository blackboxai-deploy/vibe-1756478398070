import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { ReadFileRequest, ReadFileResponse, ApiResponse } from '@/lib/types';

// POST /api/files/read - Read file contents
export async function POST(request: NextRequest) {
  try {
    const body: ReadFileRequest = await request.json();
    
    if (!body.path) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'File path is required'
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Basic security check - prevent directory traversal
    if (body.path.includes('..') || body.path.startsWith('/')) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Invalid file path'
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const workspacePath = process.cwd();
    const fullPath = join(workspacePath, body.path);
    
    try {
      const content = await readFile(fullPath, 'utf-8');
      const stats = await import('fs/promises').then(fs => fs.stat(fullPath));
      
      const fileResponse: ReadFileResponse = {
        content,
        path: body.path,
        size: stats.size
      };

      const response: ApiResponse<ReadFileResponse> = {
        success: true,
        data: fileResponse,
        message: 'File read successfully'
      };

      return NextResponse.json(response);
    } catch (fileError) {
      const errorResponse: ApiResponse = {
        success: false,
        error: fileError instanceof Error ? fileError.message : 'File not found or cannot be read'
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }
  } catch (error) {
    const errorResponse: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to read file'
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}