import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface Building {
  _id: Id<"buildings">;
  name: string;
  description?: string;
  metadata?: {
    floors?: number;
    area?: number;
    height?: number;
  };
}

interface BuildingListProps {
  projectId: Id<"projects">;
  buildings: Building[];
  onSelectBuilding: (buildingId: Id<"buildings">) => void;
}

export function BuildingList({ projectId, buildings, onSelectBuilding }: BuildingListProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBuilding, setNewBuilding] = useState({
    name: "",
    description: "",
    floors: "",
    area: "",
    height: "",
  });

  const createBuilding = useMutation(api.buildings.createBuilding);

  const handleCreateBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBuilding.name.trim()) return;

    try {
      await createBuilding({
        projectId,
        name: newBuilding.name.trim(),
        description: newBuilding.description.trim() || undefined,
        metadata: {
          floors: newBuilding.floors ? parseInt(newBuilding.floors) : undefined,
          area: newBuilding.area ? parseFloat(newBuilding.area) : undefined,
          height: newBuilding.height ? parseFloat(newBuilding.height) : undefined,
        },
      });
      
      setNewBuilding({ name: "", description: "", floors: "", area: "", height: "" });
      setShowCreateForm(false);
    } catch (error) {
      console.error("Ошибка создания здания:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Здания проекта</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Добавить здание
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Новое здание</h3>
          <form onSubmit={handleCreateBuilding} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название *
                </label>
                <input
                  type="text"
                  value={newBuilding.name}
                  onChange={(e) => setNewBuilding({ ...newBuilding, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Этажей
                </label>
                <input
                  type="number"
                  value={newBuilding.floors}
                  onChange={(e) => setNewBuilding({ ...newBuilding, floors: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Площадь (м²)
                </label>
                <input
                  type="number"
                  value={newBuilding.area}
                  onChange={(e) => setNewBuilding({ ...newBuilding, area: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Высота (м)
                </label>
                <input
                  type="number"
                  value={newBuilding.height}
                  onChange={(e) => setNewBuilding({ ...newBuilding, height: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                value={newBuilding.description}
                onChange={(e) => setNewBuilding({ ...newBuilding, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
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

      {buildings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🏢</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Нет зданий</h3>
          <p className="text-gray-600">Добавьте первое здание в проект</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buildings.map((building) => (
            <div
              key={building._id}
              onClick={() => onSelectBuilding(building._id)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {building.name}
              </h3>
              
              {building.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {building.description}
                </p>
              )}
              
              {building.metadata && (
                <div className="space-y-1 text-sm text-gray-500">
                  {building.metadata.floors && (
                    <div>Этажей: {building.metadata.floors}</div>
                  )}
                  {building.metadata.area && (
                    <div>Площадь: {building.metadata.area} м²</div>
                  )}
                  {building.metadata.height && (
                    <div>Высота: {building.metadata.height} м</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
