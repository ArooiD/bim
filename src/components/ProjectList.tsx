import { Id } from "../../convex/_generated/dataModel";

interface Project {
  _id: Id<"projects">;
  name: string;
  description?: string;
  status: "planning" | "design" | "construction" | "operation" | "completed";
  startDate: number;
  endDate?: number;
  role: "owner" | "admin" | "architect" | "engineer" | "contractor" | "viewer";
  _creationTime: number;
  createdBy: Id<"users">;
  metadata?: {
    location?: string;
    client?: string;
    budget?: number;
  };
}

interface ProjectListProps {
  projects: Project[];
  onSelectProject: (projectId: Id<"projects">) => void;
}

const statusColors = {
  planning: "bg-yellow-100 text-yellow-800",
  design: "bg-blue-100 text-blue-800", 
  construction: "bg-orange-100 text-orange-800",
  operation: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
};

const statusLabels = {
  planning: "Планирование",
  design: "Проектирование",
  construction: "Строительство", 
  operation: "Эксплуатация",
  completed: "Завершен",
};

const roleLabels = {
  owner: "Владелец",
  admin: "Администратор",
  architect: "Архитектор",
  engineer: "Инженер",
  contractor: "Подрядчик",
  viewer: "Наблюдатель",
};

export function ProjectList({ projects, onSelectProject }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🏗️</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Нет проектов</h3>
        <p className="text-gray-600">Создайте свой первый BIM-проект</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <div
          key={project._id}
          onClick={() => onSelectProject(project._id)}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {project.name}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
              {statusLabels[project.status]}
            </span>
          </div>
          
          {project.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {project.description}
            </p>
          )}
          
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>
              Роль: {roleLabels[project.role as keyof typeof roleLabels] || project.role}
            </span>
            <span>
              {new Date(project.startDate).toLocaleDateString('ru-RU')}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
