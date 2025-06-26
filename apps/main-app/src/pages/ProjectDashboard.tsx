import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@bim-platform/convex-backend'
import { ProjectList } from '@shared/components/projects/ProjectList'
import { CreateProjectModal } from '@shared/components/projects/CreateProjectModal'
import { Button } from '@shared/components/ui/Button'
import { Id } from '@bim-platform/convex-backend/dataModel'

export function ProjectDashboard() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const projects = useQuery(api.projects.getUserProjects)

  if (projects === undefined) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Мои проекты</h1>
          <p className="text-gray-600 mt-2">Управление BIM-проектами и зданиями</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          Создать проект
        </Button>
      </div>

      <ProjectList 
        projects={projects.filter((p): p is NonNullable<typeof p> => p !== null)} 
      />

      {showCreateModal && (
        <CreateProjectModal 
          onClose={() => setShowCreateModal(false)}
          onCreated={() => setShowCreateModal(false)}
        />
      )}
    </div>
  )
}
