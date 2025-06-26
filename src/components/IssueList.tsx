import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface Issue {
  _id: Id<"issues">;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "resolved" | "closed";
  elementIds: string[];
  creator: { name?: string; email?: string } | null;
  assignee: { name?: string; email?: string } | null;
  dueDate?: number;
  _creationTime: number;
}

interface IssueListProps {
  projectId: Id<"projects">;
  issues: Issue[];
}

const priorityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const statusColors = {
  open: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
};

const priorityLabels = {
  low: "Низкий",
  medium: "Средний", 
  high: "Высокий",
  critical: "Критический",
};

const statusLabels = {
  open: "Открыто",
  in_progress: "В работе",
  resolved: "Решено",
  closed: "Закрыто",
};

export function IssueList({ projectId, issues }: IssueListProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [newIssue, setNewIssue] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    elementIds: "",
  });

  const createIssue = useMutation(api.issues.createIssue);
  const updateIssueStatus = useMutation(api.issues.updateIssueStatus);

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIssue.title.trim()) return;

    try {
      await createIssue({
        projectId,
        title: newIssue.title.trim(),
        description: newIssue.description.trim(),
        priority: newIssue.priority,
        elementIds: newIssue.elementIds.split(",").map(id => id.trim()).filter(Boolean),
      });
      
      setNewIssue({ title: "", description: "", priority: "medium", elementIds: "" });
      setShowCreateForm(false);
    } catch (error) {
      console.error("Ошибка создания замечания:", error);
    }
  };

  const handleStatusChange = async (issueId: Id<"issues">, newStatus: Issue["status"]) => {
    try {
      await updateIssueStatus({ issueId, status: newStatus });
    } catch (error) {
      console.error("Ошибка обновления статуса:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Замечания</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Создать замечание
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Новое замечание</h3>
          <form onSubmit={handleCreateIssue} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Заголовок *
              </label>
              <input
                type="text"
                value={newIssue.title}
                onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание *
              </label>
              <textarea
                value={newIssue.description}
                onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Приоритет
                </label>
                <select
                  value={newIssue.priority}
                  onChange={(e) => setNewIssue({ ...newIssue, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                  <option value="critical">Критический</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID элементов (через запятую)
                </label>
                <input
                  type="text"
                  value={newIssue.elementIds}
                  onChange={(e) => setNewIssue({ ...newIssue, elementIds: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="element1, element2"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Создать
              </button>
            </div>
          </form>
        </div>
      )}

      {issues.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Нет замечаний</h3>
          <p className="text-gray-600">Создайте первое замечание для проекта</p>
        </div>
      ) : (
        <div className="space-y-4">
          {issues.map((issue) => (
            <div
              key={issue._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {issue.title}
                  </h3>
                  <p className="text-gray-600 mb-3">{issue.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[issue.priority]}`}>
                      {priorityLabels[issue.priority]}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[issue.status]}`}>
                      {statusLabels[issue.status]}
                    </span>
                    {issue.elementIds.length > 0 && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Элементов: {issue.elementIds.length}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-500 space-y-1">
                    <div>Создано: {issue.creator?.name || issue.creator?.email || "Неизвестно"}</div>
                    {issue.assignee && (
                      <div>Исполнитель: {issue.assignee.name || issue.assignee.email}</div>
                    )}
                    <div>Дата: {new Date(issue._creationTime).toLocaleDateString('ru-RU')}</div>
                    {issue.dueDate && (
                      <div>Срок: {new Date(issue.dueDate).toLocaleDateString('ru-RU')}</div>
                    )}
                  </div>
                </div>
                
                <div className="ml-4">
                  <select
                    value={issue.status}
                    onChange={(e) => handleStatusChange(issue._id, e.target.value as Issue["status"])}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="open">Открыто</option>
                    <option value="in_progress">В работе</option>
                    <option value="resolved">Решено</option>
                    <option value="closed">Закрыто</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
