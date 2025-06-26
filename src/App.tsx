import { Routes, Route, Navigate, BrowserRouter, useParams, Link } from 'react-router-dom'
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { ProjectDashboard } from "./components/ProjectDashboard";
import { ProjectView } from "./components/ProjectView";
import { BuildingViewer } from "./components/BuildingViewer";
import { Id } from "../convex/_generated/dataModel";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Authenticated>
          <AppLayout />
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
    </BrowserRouter>
  );
}

function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-6">
        <Link to="/" className="text-xl font-semibold text-blue-600">BIM Platform</Link>
        <SignOutButton />
      </header>
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<ProjectDashboard />} />
          <Route path="/projects/:projectId" element={<ProjectViewWrapper />} />
          <Route path="/buildings/:buildingId" element={<BuildingViewerWrapper />} />
          <Route path="/viewer" element={<div className="p-8"><h1>🏗️ 3D Просмотрщик</h1></div>} />
          <Route path="/admin" element={<div className="p-8"><h1>⚙️ Админ панель</h1></div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function ProjectViewWrapper() {
  const { projectId } = useParams<{ projectId: string }>();
  
  if (!projectId) {
    return <Navigate to="/" replace />;
  }

  return (
    <ProjectView 
      projectId={projectId as Id<"projects">} 
      onBack={() => window.history.back()} 
    />
  );
}

function BuildingViewerWrapper() {
  const { buildingId } = useParams<{ buildingId: string }>();
  
  if (!buildingId) {
    return <Navigate to="/" replace />;
  }

  return (
    <BuildingViewer 
      buildingId={buildingId as Id<"buildings">} 
      onBack={() => window.history.back()}
    />
  );
}
