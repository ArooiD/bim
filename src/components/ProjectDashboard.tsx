import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ProjectList } from "./ProjectList";
import { CreateProjectModal } from "./CreateProjectModal";
import { useNavigate } from "react-router-dom";

export function ProjectDashboard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();
  
  const projects = useQuery(api.projects.getUserProjects);

  if (projects === undefined) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }



  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Мои проекты</h1>
          <p className="text-gray-600 mt-2">Управление BIM-проектами и зданиями</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Создать проект
        </button>
      </div>

      <ProjectList 
        projects={projects.filter((p): p is NonNullable<typeof p> => p !== null)} 
        onSelectProject={(projectId) => navigate(`/projects/${projectId}`)} 
      />

      {showCreateModal && (
        <CreateProjectModal 
          onClose={() => setShowCreateModal(false)}
          onCreated={(projectId) => {
            setShowCreateModal(false);
            navigate(`/projects/${projectId}`);
          }}
        />
      )}
    </div>
  );
}
