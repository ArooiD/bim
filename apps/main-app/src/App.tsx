import { Routes, Route, Navigate } from 'react-router-dom'
import { Authenticated, Unauthenticated } from 'convex/react'
import { Toaster } from 'sonner'
import { Layout } from '@shared/components/Layout'
import { SignInForm } from '@shared/components/auth/SignInForm'
import { ProjectDashboard } from './pages/ProjectDashboard'
import { ProjectView } from './pages/ProjectView'
import { BuildingView } from './pages/BuildingView'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Authenticated>
        <Layout>
          <Routes>
            <Route path="/" element={<ProjectDashboard />} />
            <Route path="/projects/:projectId" element={<ProjectView />} />
            <Route path="/buildings/:buildingId" element={<BuildingView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Authenticated>
      
      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-full max-w-md mx-auto p-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-blue-600 mb-4">BIM Platform</h1>
              <p className="text-xl text-gray-600">
                Управление BIM-проектами и 3D-визуализация
              </p>
            </div>
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>
      
      <Toaster />
    </div>
  )
}
