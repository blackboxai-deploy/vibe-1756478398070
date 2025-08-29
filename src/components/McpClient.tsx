'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { McpTool } from '@/lib/types'

const MCP_TOOLS: McpTool[] = [
  {
    name: 'list_tasks',
    description: 'Get all tasks from the task manager',
    parameters: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'create_task',
    description: 'Create a new task',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Task title' },
        description: { type: 'string', description: 'Task description' }
      },
      required: ['title', 'description']
    }
  },
  {
    name: 'update_task',
    description: 'Update an existing task',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Task ID' },
        title: { type: 'string', description: 'Task title' },
        description: { type: 'string', description: 'Task description' },
        completed: { type: 'boolean', description: 'Task completion status' }
      },
      required: ['id']
    }
  },
  {
    name: 'delete_task',
    description: 'Delete a task',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Task ID' }
      },
      required: ['id']
    }
  },
  {
    name: 'read_file',
    description: 'Read contents of a file',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path to read' }
      },
      required: ['path']
    }
  },
  {
    name: 'list_files',
    description: 'List files in the workspace',
    parameters: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'system_info',
    description: 'Get system information',
    parameters: {
      type: 'object',
      properties: {}
    }
  }
]

export default function McpClient() {
  const [selectedTool, setSelectedTool] = useState<McpTool | null>(null)
  const [parameters, setParameters] = useState('')
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(false)

  const selectTool = (tool: McpTool) => {
    setSelectedTool(tool)
    
    // Generate example parameters based on the tool
    let exampleParams = '{}'
    
    if (tool.parameters.properties && Object.keys(tool.parameters.properties).length > 0) {
      const example: any = {}
      Object.entries(tool.parameters.properties).forEach(([key, prop]: [string, any]) => {
        if (prop.type === 'string') {
          if (key === 'id') example[key] = '1'
          else if (key === 'title') example[key] = 'Sample Task'
          else if (key === 'description') example[key] = 'Sample task description'
          else if (key === 'path') example[key] = 'package.json'
          else example[key] = 'sample value'
        } else if (prop.type === 'boolean') {
          example[key] = true
        }
      })
      exampleParams = JSON.stringify(example, null, 2)
    }
    
    setParameters(exampleParams)
    setResponse(null)
  }

  const executeTool = async () => {
    if (!selectedTool) return

    setLoading(true)

    try {
      // Parse parameters
      let parsedParams = {}
      if (parameters.trim()) {
        parsedParams = JSON.parse(parameters)
      }

      // Simulate MCP tool execution via HTTP API for demo
      // In a real implementation, this would go through the MCP protocol
      const toolResponse = await simulateToolExecution(selectedTool.name, parsedParams)
      
      setResponse(toolResponse)
    } catch (error) {
      setResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setLoading(false)
    }
  }

  // Simulate MCP tool execution by mapping to HTTP API calls
  const simulateToolExecution = async (toolName: string, params: any) => {
    try {
      switch (toolName) {
        case 'list_tasks':
          const tasksResponse = await fetch('/api/tasks')
          return await tasksResponse.json()

        case 'create_task':
          if (!params.title || !params.description) {
            throw new Error('Title and description are required')
          }
          const createResponse = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
          })
          return await createResponse.json()

        case 'update_task':
          if (!params.id) {
            throw new Error('Task ID is required')
          }
          const { id, ...updateData } = params
          const updateResponse = await fetch(`/api/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
          })
          return await updateResponse.json()

        case 'delete_task':
          if (!params.id) {
            throw new Error('Task ID is required')
          }
          const deleteResponse = await fetch(`/api/tasks/${params.id}`, {
            method: 'DELETE'
          })
          return await deleteResponse.json()

        case 'read_file':
          if (!params.path) {
            throw new Error('File path is required')
          }
          const readResponse = await fetch('/api/files/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
          })
          return await readResponse.json()

        case 'list_files':
          const filesResponse = await fetch('/api/files')
          return await filesResponse.json()

        case 'system_info':
          const statusResponse = await fetch('/api/status')
          return await statusResponse.json()

        default:
          throw new Error(`Unknown tool: ${toolName}`)
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Tool execution failed'
      }
    }
  }

  const connect = () => {
    // Simulate connection to MCP server
    setConnected(true)
    setResponse({
      success: true,
      message: 'Connected to MCP server (simulated)',
      tools: MCP_TOOLS.length
    })
  }

  const disconnect = () => {
    setConnected(false)
    setResponse({
      success: true,
      message: 'Disconnected from MCP server'
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            MCP Client
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-muted-foreground">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </CardTitle>
          <CardDescription>
            Interact with MCP server tools and capabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Controls */}
          <div className="flex space-x-2">
            <Button 
              onClick={connect} 
              disabled={connected}
              variant={connected ? 'outline' : 'default'}
            >
              Connect
            </Button>
            <Button 
              onClick={disconnect} 
              disabled={!connected}
              variant="outline"
            >
              Disconnect
            </Button>
          </div>

          {/* Tool Selection */}
          {connected && (
            <>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Available Tools</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                    {MCP_TOOLS.map((tool) => (
                      <Card
                        key={tool.name}
                        className={`cursor-pointer transition-colors hover:bg-accent ${
                          selectedTool?.name === tool.name ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => selectTool(tool)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">{tool.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-xs text-muted-foreground">{tool.description}</p>
                          {tool.parameters.required && tool.parameters.required.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {tool.parameters.required.map(param => (
                                <Badge key={param} variant="outline" className="text-xs">
                                  {param}*
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Tool Execution */}
                {selectedTool && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{selectedTool.name}</Badge>
                      <span className="text-sm text-muted-foreground">{selectedTool.description}</span>
                    </div>

                    {selectedTool.parameters.properties && Object.keys(selectedTool.parameters.properties).length > 0 && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Parameters (JSON)</label>
                        <Textarea
                          placeholder="Enter tool parameters as JSON"
                          value={parameters}
                          onChange={(e) => setParameters(e.target.value)}
                          rows={6}
                          className="font-mono text-sm"
                        />
                      </div>
                    )}

                    <Button onClick={executeTool} disabled={loading} className="w-full">
                      {loading ? 'Executing Tool...' : 'Execute Tool'}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Response */}
          {response && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Response</h4>
                <Badge variant={response.success ? 'default' : 'destructive'}>
                  {response.success ? 'Success' : 'Error'}
                </Badge>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-xs overflow-auto max-h-96 whitespace-pre-wrap">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}