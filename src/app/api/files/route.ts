import { NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { FileInfo, ApiResponse } from '@/lib/types';

// GET /api/files - List files in workspace
export async function GET() {
  try {
    const workspacePath = process.cwd();
    const entries = await readdir(workspacePath);
    
    const files: FileInfo[] = [];
    
    for (const entry of entries) {
      try {
        const fullPath = join(workspacePath, entry);
        const stats = await stat(fullPath);
        
        // Skip node_modules and other build directories
        if (['node_modules', '.next', '.git', 'dist', 'build'].includes(entry)) {
          continue;
        }
        
        files.push({
          name: entry,
          path: entry,
          type: stats.isDirectory() ? 'directory' : 'file',
          size: stats.isFile() ? stats.size : undefined,
          modified: stats.mtime
        });
      } catch (error) {
        // Skip files we can't read
        console.warn(`Could not read file info for ${entry}:`, error);
      }
    }
    
    const response: ApiResponse<FileInfo[]> = {
      success: true,
      data: files,
      message: `Listed ${files.length} files and directories`
    };
    
    return NextResponse.json(response);
  } catch (error) {
    const errorResponse: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list files'
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}