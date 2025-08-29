'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Task, CreateTaskRequest, UpdateTaskRequest } from '@/lib/types'

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newTask, setNewTask] = useState<CreateTaskRequest>({ title: '', description: '' })
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editForm, setEditForm] = useState<UpdateTaskRequest>({})

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tasks')
      const data = await response.json()
      if (data.success) {
        setTasks(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const createTask = async () => {
    if (!newTask.title.trim() || !newTask.description.trim()) {
      return
    }

    try {
      setCreating(true)
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      })
      const data = await response.json()
      if (data.success) {
        setTasks([...tasks, data.data])
        setNewTask({ title: '', description: '' })
      }
    } catch (error) {
      console.error('Failed to create task:', error)
    } finally {
      setCreating(false)
    }
  }

  const updateTask = async (taskId: string, updates: UpdateTaskRequest) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const data = await response.json()
      if (data.success) {
        setTasks(tasks.map(task => task.id === taskId ? data.data : task))
        setEditingTask(null)
        setEditForm({})
      }
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success) {
        setTasks(tasks.filter(task => task.id !== taskId))
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const toggleComplete = async (task: Task) => {
    await updateTask(task.id, { completed: !task.completed })
  }

  const startEditing = (task: Task) => {
    setEditingTask(task)
    setEditForm({
      title: task.title,
      description: task.description,
      completed: task.completed
    })
  }

  const saveEdit = async () => {
    if (editingTask) {
      await updateTask(editingTask.id, editForm)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Create New Task */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Task</CardTitle>
          <CardDescription>Add a new task to your list</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Task title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
          <Textarea
            placeholder="Task description"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          />
          <Button 
            onClick={createTask} 
            disabled={creating || !newTask.title.trim() || !newTask.description.trim()}
            className="w-full"
          >
            {creating ? 'Creating...' : 'Create Task'}
          </Button>
        </CardContent>
      </Card>

      {/* Task List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Tasks ({tasks.length})</h3>
          <Button variant="outline" onClick={fetchTasks}>
            Refresh
          </Button>
        </div>

        {tasks.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No tasks found. Create your first task above!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task) => (
              <Card key={task.id} className={task.completed ? 'opacity-75' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleComplete(task)}
                      />
                      <CardTitle className={`text-base ${task.completed ? 'line-through' : ''}`}>
                        {task.title}
                      </CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={task.completed ? 'default' : 'secondary'}>
                        {task.completed ? 'Complete' : 'Pending'}
                      </Badge>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => startEditing(task)}>
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Task</DialogTitle>
                            <DialogDescription>
                              Make changes to your task here.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input
                              placeholder="Task title"
                              value={editForm.title || ''}
                              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            />
                            <Textarea
                              placeholder="Task description"
                              value={editForm.description || ''}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            />
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={editForm.completed || false}
                                onCheckedChange={(checked) => setEditForm({ ...editForm, completed: checked as boolean })}
                              />
                              <span className="text-sm">Mark as completed</span>
                            </div>
                            <div className="flex space-x-2">
                              <Button onClick={saveEdit} className="flex-1">
                                Save Changes
                              </Button>
                              <Button variant="outline" onClick={() => setEditingTask(null)} className="flex-1">
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="destructive" size="sm" onClick={() => deleteTask(task.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                    <span>Updated: {new Date(task.updatedAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}