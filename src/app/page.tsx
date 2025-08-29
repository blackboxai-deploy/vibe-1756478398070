'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ServerStatus } from '@/lib/types'
import ApiExplorer from '@/components/ApiExplorer'
import McpClient from '@/components/McpClient'
import TaskManager from '@/components/TaskManager'

export default function HomePage() {
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/status')
        const data = await response.json()
        if (data.success) {
          setServerStatus(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch server status:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
    // Refresh status every 30 seconds
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatUptime = (uptime: number) => {
    const seconds = Math.floor(uptime / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    }
    return `${seconds}s`
  }

  const formatBytes = (bytes: number) => {
    const MB = 1024 * 1024
    return `${(bytes / MB).toFixed(1)} MB`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Server Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">HTTP API</CardTitle>
            <Badge variant={serverStatus?.httpApi.status === 'running' ? 'default' : 'destructive'}>
              {serverStatus?.httpApi.status || 'Unknown'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Port {serverStatus?.httpApi.port || '3000'}</div>
            <p className="text-xs text-muted-foreground">
              Uptime: {serverStatus ? formatUptime(serverStatus.httpApi.uptime) : 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MCP Server</CardTitle>
            <Badge variant={serverStatus?.mcpServer.status === 'running' ? 'default' : 'destructive'}>
              {serverStatus?.mcpServer.status || 'Unknown'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serverStatus?.mcpServer.tools.length || 0} Tools</div>
            <p className="text-xs text-muted-foreground">
              {serverStatus?.mcpServer.connections || 0} connections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {serverStatus ? formatBytes(serverStatus.system.memory.used) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              of {serverStatus ? formatBytes(serverStatus.system.memory.total) : 'N/A'} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Tools</CardTitle>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {serverStatus?.mcpServer.tools.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              MCP tools ready
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Interface */}
      <Card>
        <CardHeader>
          <CardTitle>API & MCP Server Interface</CardTitle>
          <CardDescription>
            Interact with both the HTTP API and MCP server through the tabs below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tasks" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="tasks">Task Manager</TabsTrigger>
              <TabsTrigger value="api">API Explorer</TabsTrigger>
              <TabsTrigger value="mcp">MCP Client</TabsTrigger>
              <TabsTrigger value="status">Status</TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="space-y-4">
              <TaskManager />
            </TabsContent>

            <TabsContent value="api" className="space-y-4">
              <ApiExplorer />
            </TabsContent>

            <TabsContent value="mcp" className="space-y-4">
              <McpClient />
            </TabsContent>

            <TabsContent value="status" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>HTTP API Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant={serverStatus?.httpApi.status === 'running' ? 'default' : 'destructive'}>
                        {serverStatus?.httpApi.status || 'Unknown'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Port:</span>
                      <span>{serverStatus?.httpApi.port || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uptime:</span>
                      <span>{serverStatus ? formatUptime(serverStatus.httpApi.uptime) : 'N/A'}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>MCP Server Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant={serverStatus?.mcpServer.status === 'running' ? 'default' : 'destructive'}>
                        {serverStatus?.mcpServer.status || 'Unknown'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Connections:</span>
                      <span>{serverStatus?.mcpServer.connections || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tools:</span>
                      <span>{serverStatus?.mcpServer.tools.length || 0}</span>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Available Tools:</p>
                      <div className="flex flex-wrap gap-1">
                        {serverStatus?.mcpServer.tools.map(tool => (
                          <Badge key={tool} variant="outline" className="text-xs">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}