'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ApiEndpoint {
  name: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  description: string
  requiresBody?: boolean
  bodyTemplate?: string
}

const API_ENDPOINTS: ApiEndpoint[] = [
  {
    name: 'Server Status',
    method: 'GET',
    path: '/api/status',
    description: 'Get server status and system information'
  },
  {
    name: 'List Tasks',
    method: 'GET',
    path: '/api/tasks',
    description: 'Retrieve all tasks'
  },
  {
    name: 'Create Task',
    method: 'POST',
    path: '/api/tasks',
    description: 'Create a new task',
    requiresBody: true,
    bodyTemplate: '{\n  "title": "Sample Task",\n  "description": "This is a sample task description"\n}'
  },
  {
    name: 'Get Task',
    method: 'GET',
    path: '/api/tasks/{id}',
    description: 'Get a specific task by ID'
  },
  {
    name: 'Update Task',
    method: 'PUT',
    path: '/api/tasks/{id}',
    description: 'Update an existing task',
    requiresBody: true,
    bodyTemplate: '{\n  "title": "Updated Task Title",\n  "description": "Updated description",\n  "completed": true\n}'
  },
  {
    name: 'Delete Task',
    method: 'DELETE',
    path: '/api/tasks/{id}',
    description: 'Delete a task'
  },
  {
    name: 'List Files',
    method: 'GET',
    path: '/api/files',
    description: 'List files in the workspace'
  },
  {
    name: 'Read File',
    method: 'POST',
    path: '/api/files/read',
    description: 'Read contents of a file',
    requiresBody: true,
    bodyTemplate: '{\n  "path": "package.json"\n}'
  }
]

export default function ApiExplorer() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null)
  const [customUrl, setCustomUrl] = useState('')
  const [requestBody, setRequestBody] = useState('')
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [responseTime, setResponseTime] = useState<number | null>(null)

  const selectEndpoint = (endpoint: ApiEndpoint) => {
    setSelectedEndpoint(endpoint)
    setCustomUrl(endpoint.path)
    setRequestBody(endpoint.bodyTemplate || '')
    setResponse(null)
    setResponseTime(null)
  }

  const executeRequest = async () => {
    if (!selectedEndpoint && !customUrl) return

    setLoading(true)
    const startTime = Date.now()

    try {
      const url = customUrl || selectedEndpoint?.path || ''
      const method = selectedEndpoint?.method || 'GET'

      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      }

      if (method !== 'GET' && requestBody.trim()) {
        try {
          // Validate JSON
          JSON.parse(requestBody)
          options.body = requestBody
        } catch {
          setResponse({
            error: 'Invalid JSON in request body',
            status: 'client_error'
          })
          setLoading(false)
          return
        }
      }

      const fetchResponse = await fetch(url, options)
      const endTime = Date.now()
      setResponseTime(endTime - startTime)

      const responseData = await fetchResponse.json()

      setResponse({
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        headers: Object.fromEntries(fetchResponse.headers.entries()),
        data: responseData
      })
    } catch (error) {
      const endTime = Date.now()
      setResponseTime(endTime - startTime)
      
      setResponse({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'network_error'
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status?: number | string) => {
    if (typeof status === 'number') {
      if (status >= 200 && status < 300) return 'bg-green-500'
      if (status >= 400 && status < 500) return 'bg-yellow-500'
      if (status >= 500) return 'bg-red-500'
    }
    return 'bg-gray-500'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Explorer</CardTitle>
          <CardDescription>
            Test HTTP API endpoints interactively
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="endpoints" className="space-y-4">
            <TabsList>
              <TabsTrigger value="endpoints">Quick Test</TabsTrigger>
              <TabsTrigger value="custom">Custom Request</TabsTrigger>
            </TabsList>

            <TabsContent value="endpoints" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {API_ENDPOINTS.map((endpoint) => (
                  <Card
                    key={`${endpoint.method}-${endpoint.path}`}
                    className={`cursor-pointer transition-colors hover:bg-accent ${
                      selectedEndpoint === endpoint ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => selectEndpoint(endpoint)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{endpoint.name}</CardTitle>
                        <Badge variant={endpoint.method === 'GET' ? 'default' : 
                                      endpoint.method === 'POST' ? 'secondary' :
                                      endpoint.method === 'PUT' ? 'outline' : 'destructive'}>
                          {endpoint.method}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground mb-2">{endpoint.path}</p>
                      <p className="text-xs">{endpoint.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select onValueChange={(value) => setSelectedEndpoint(API_ENDPOINTS.find(e => e.method === value) || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
                <div className="md:col-span-3">
                  <Input
                    placeholder="Enter API endpoint (e.g., /api/tasks)"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Request Configuration */}
          {selectedEndpoint && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center space-x-2">
                <Badge variant={selectedEndpoint.method === 'GET' ? 'default' : 
                              selectedEndpoint.method === 'POST' ? 'secondary' :
                              selectedEndpoint.method === 'PUT' ? 'outline' : 'destructive'}>
                  {selectedEndpoint.method}
                </Badge>
                <code className="text-sm bg-muted px-2 py-1 rounded">{customUrl}</code>
              </div>

              {selectedEndpoint.requiresBody && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Request Body (JSON)</label>
                  <Textarea
                    placeholder="Enter JSON request body"
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>
              )}

              <Button onClick={executeRequest} disabled={loading} className="w-full">
                {loading ? 'Sending Request...' : 'Send Request'}
              </Button>
            </div>
          )}

          {/* Response */}
          {response && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Response</h4>
                <div className="flex items-center space-x-2">
                  {responseTime && (
                    <span className="text-xs text-muted-foreground">{responseTime}ms</span>
                  )}
                  {response.status && (
                    <Badge className={`${getStatusColor(response.status)} text-white`}>
                      {response.status} {response.statusText}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-xs overflow-auto max-h-96">
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