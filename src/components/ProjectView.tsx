import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { BuildingList } from "./BuildingList";
import { IssueList } from "./IssueList";
import { useNavigate } from "react-router-dom";

interface ProjectViewProps {
  projectId: Id<"projects">;
  onBack: () => void;
}

type TabType = "buildings" | "issues" | "settings";

export function ProjectView({ projectId, onBack }: ProjectViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("buildings");
  const navigate = useNavigate();

  const project = useQuery(api.projects.getProject, { projectId });
  const buildings = useQuery(api.buildings.getProjectBuildings, { projectId });
  const issues = useQuery(api.issues.getProjectIssues, { projectId });

  if (project === undefined || buildings === undefined || issues === undefined) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }



  const statusLabels = {
    planning: "Планирование",
    design: "Проектирование", 
    construction: "Строительство",
    operation: "Эксплуатация",
    completed: "Завершен",
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Заголовок проекта */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Назад к проектам
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.name}</h1>
            {project.description && (
              <p className="text-gray-600 mb-4">{project.description}</p>
            )}
            <div className="flex gap-4 text-sm text-gray-500">
              <span>Статус: {statusLabels[project.status]}</span>
              <span>Создан: {new Date(project.startDate).toLocaleDateString('ru-RU')}</span>
              <span>Роль: {project.userRole}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Навигация по вкладкам */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("buildings")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "buildings"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Здания ({buildings.length})
          </button>
          <button
            onClick={() => setActiveTab("issues")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "issues"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Замечания ({issues.length})
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "settings"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Настройки
          </button>
        </nav>
      </div>

      {/* Содержимое вкладок */}
      {activeTab === "buildings" && (
        <BuildingList
          projectId={projectId}
          buildings={buildings}
          onSelectBuilding={(buildingId) => navigate(`/buildings/${buildingId}`)}
        />
      )}

      {activeTab === "issues" && (
        <IssueList projectId={projectId} issues={issues} />
      )}

      {activeTab === "settings" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Настройки проекта</h3>
          <p className="text-gray-600">Настройки проекта будут добавлены в следующих версиях.</p>
        </div>
      )}
    </div>
  );
}
