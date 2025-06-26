export interface Project {
  _id: string
  name: string
  description?: string
  status: 'planning' | 'design' | 'construction' | 'operation' | 'completed'
  startDate: number
  endDate?: number
  metadata?: {
    location?: string
    client?: string
    budget?: number
  }
}

export interface Building {
  _id: string
  projectId: string
  name: string
  description?: string
  ifcFileId?: string
  thatOpenModelId?: string
  metadata?: {
    floors?: number
    area?: number
    height?: number
  }
}

export interface Issue {
  _id: string
  projectId: string
  buildingId?: string
  elementIds: string[]
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  assignedTo?: string
  createdBy: string
  dueDate?: number
  _creationTime: number
}

export interface User {
  _id: string
  name?: string
  email?: string
  role: 'admin' | 'user'
}
