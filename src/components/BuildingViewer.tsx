import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface BuildingViewerProps {
  buildingId: Id<"buildings">;
  onBack: () => void;
}

export function BuildingViewer({ buildingId, onBack }: BuildingViewerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const building = useQuery(api.buildings.getBuilding, { buildingId });
  const elements = useQuery(api.buildings.getBuildingElements, { buildingId });
  const files = useQuery(api.buildings.getBuildingFiles, { buildingId });
  const fileStats = useQuery(api.buildings.getFileProcessingStats, { buildingId });
  
  const generateUploadUrl = useMutation(api.buildings.generateIfcUploadUrl);
  const updateBuildingIfc = useMutation(api.buildings.updateBuildingIfc);
  const testProcessFile = useMutation(api.buildings.testProcessFile);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  if (building === undefined || elements === undefined || files === undefined || fileStats === undefined) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Назад к проекту
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{building.name}</h1>
        {building.description && (
          <p className="text-gray-600 mb-4">{building.description}</p>
        )}
        
        {building.metadata && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {building.metadata.floors && (
              <div className="bg-gray-50 p-3 rounded">
                <div className="font-medium text-gray-900">Этажей</div>
                <div className="text-gray-600">{building.metadata.floors}</div>
              </div>
            )}
            {building.metadata.area && (
              <div className="bg-gray-50 p-3 rounded">
                <div className="font-medium text-gray-900">Площадь</div>
                <div className="text-gray-600">{building.metadata.area} м²</div>
              </div>
            )}
            {building.metadata.height && (
              <div className="bg-gray-50 p-3 rounded">
                <div className="font-medium text-gray-900">Высота</div>
                <div className="text-gray-600">{building.metadata.height} м</div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3D Viewer */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">3D Модель</h2>
          <div className="aspect-video bg-gray-100 rounded-lg relative">
            <div id="thatopen-viewer" className="w-full h-full rounded-lg">
              <div className="absolute inset-0 flex items-center justify-center text-center text-gray-500">
                <div>
                  <div className="text-4xl mb-2">🏗️</div>
                  <p>ThatOpen 3D Viewer</p>
                  <p className="text-sm mt-1">Загрузите IFC файл для просмотра</p>
                  <button 
                    onClick={handleUploadClick}
                    disabled={isUploading}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isUploading ? "Загрузка..." : "Загрузить IFC"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".ifc"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsUploading(true);
                      try {
                        const url = await generateUploadUrl();
                        const res = await fetch(url, { method: "POST", body: file });
                        const { storageId } = await res.json();
                        await updateBuildingIfc({ 
                          buildingId, 
                          ifcFileId: storageId,
                          fileName: file.name,
                          fileSize: file.size
                        });
                        alert('Файл загружен и отправлен на обработку! Элементы появятся через несколько секунд.');
                      } catch (error) {
                        alert('Ошибка');
                      } finally {
                        setIsUploading(false);
                        e.target.value = '';
                      }
                    }}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Элементы здания */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Элементы здания ({elements.length})</h2>
          
          {elements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-2xl mb-2">📦</div>
              <p>Нет элементов</p>
              <p className="text-sm">Загрузите IFC файл для импорта элементов</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {elements.map((element) => (
                <div
                  key={element._id}
                  className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{element.name}</h3>
                      <p className="text-sm text-gray-600">Тип: {element.type}</p>
                      {element.category && (
                        <p className="text-sm text-gray-600">Категория: {element.category}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {element.elementId}
                    </span>
                  </div>
                  
                  {element.documentation && element.documentation.length > 0 && (
                    <div className="mt-2 text-xs text-blue-600">
                      📄 Документация ({element.documentation.length})
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Файлы */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">📁 Файлы ({files.length})</h2>
            {files.length > 0 && (
              <button
                onClick={async () => {
                  try {
                    await testProcessFile({ buildingId });
                    alert('🚀 Тестовая обработка запущена! Проверьте консоль браузера.');
                  } catch (error) {
                    alert('Ошибка: ' + (error as Error).message);
                  }
                }}
                className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                🧪 Тест обработки
              </button>
            )}
          </div>
          {files.map((file) => (
            <div key={file._id} className="border-b pb-2 mb-2">
              <div className="text-sm font-medium">{file.fileName}</div>
              <div className="text-xs text-gray-500">
                {file.fileType} • {(file.fileSize / 1024 / 1024).toFixed(1)}MB • {file.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
