import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Пример action для обработки IFC файлов
// В реальной реализации здесь будет интеграция с ThatOpen Engine

export const processIfcFile = action({
  args: {
    buildingId: v.id("buildings"),
    ifcFileId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // Получаем файл из хранилища
    const fileUrl = await ctx.storage.getUrl(args.ifcFileId);
    if (!fileUrl) {
      throw new Error("Файл не найден");
    }

    try {
      // Здесь будет логика обработки IFC файла с помощью ThatOpen
      // 1. Загрузка IFC файла
      // 2. Парсинг структуры здания
      // 3. Извлечение элементов (стены, двери, окна и т.д.)
      // 4. Сохранение элементов в базу данных
      
      console.log(`🚀 НАЧАЛО: Обработка IFC файла для здания ${args.buildingId}`);
      console.log(`📂 URL файла: ${fileUrl}`);

      // Сохраняем файл физически на диск (симуляция)
      const saveResult = await saveFileToLocalStorage(fileUrl, args.buildingId, args.ifcFileId);
      console.log(`💾 Файл сохранен:`, saveResult);

      // Добавляем небольшую задержку для имитации обработки
      console.log(`⏳ Начинаем парсинг IFC файла...`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 секунды задержки

      // Пример извлеченных элементов (в реальности будет парсинг IFC)
      const mockElements = [
        {
          elementId: "wall_001",
          name: "Наружная стена",
          type: "Wall",
          category: "Structural",
          properties: {
            material: "Кирпич",
            thickness: 250,
            height: 3000,
            area: 15.5,
          },
        },
        {
          elementId: "door_001", 
          name: "Входная дверь",
          type: "Door",
          category: "Opening",
          properties: {
            width: 900,
            height: 2100,
            material: "Металл",
          },
        },
        {
          elementId: "window_001",
          name: "Окно",
          type: "Window", 
          category: "Opening",
          properties: {
            width: 1200,
            height: 1500,
            glazing: "Двойное",
          },
        },
      ];

      // Сохраняем элементы в базу данных
      console.log(`📦 Создаем ${mockElements.length} элементов здания...`);
      for (const element of mockElements) {
        console.log(`➕ Создаем элемент: ${element.name} (${element.type})`);
        await ctx.runMutation(internal.buildings.insertBuildingElement, {
          buildingId: args.buildingId,
          elementId: element.elementId,
          name: element.name,
          type: element.type,
          category: element.category,
          properties: element.properties,
        });
      }
      console.log(`✅ Все элементы созданы!`);

      // Обновляем статус файла на "completed"
      console.log(`🔄 Обновляем статус файла на "completed"...`);
      await ctx.runMutation(internal.buildings.updateFileStatus, {
        buildingId: args.buildingId,
        storageId: args.ifcFileId,
        status: "completed",
      });

      console.log(`🎉 ЗАВЕРШЕНО: IFC файл успешно обработан!`);
      console.log(`📊 Статистика: ${mockElements.length} элементов создано`);

      return {
        success: true,
        elementsCount: mockElements.length,
        message: "IFC файл успешно обработан",
      };

    } catch (error) {
      console.error("❌ ОШИБКА обработки IFC файла:", error);
      
      // Обновляем статус файла на "error"
      try {
        await ctx.runMutation(internal.buildings.updateFileStatus, {
          buildingId: args.buildingId,
          storageId: args.ifcFileId,
          status: "error",
          errorMessage: error instanceof Error ? error.message : "Неизвестная ошибка",
        });
      } catch (updateError) {
        console.error("❌ Ошибка обновления статуса файла:", updateError);
      }
      
      throw new Error("Не удалось обработать IFC файл");
    }
  },
});

// Внутренняя функция для создания элемента здания
export const createBuildingElement = action({
  args: {
    buildingId: v.id("buildings"),
    elementId: v.string(),
    name: v.string(),
    type: v.string(),
    category: v.optional(v.string()),
    properties: v.object({}),
    documentation: v.optional(v.array(v.object({
      title: v.string(),
      content: v.string(),
      fileId: v.optional(v.id("_storage")),
    }))),
  },
  handler: async (ctx, args): Promise<any> => {
    return await ctx.runMutation(internal.buildings.insertBuildingElement, args);
  },
});

// Функция для сохранения файла на локальный диск
async function saveFileToLocalStorage(fileUrl: string, buildingId: string, storageId: string) {
  try {
    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();
    
    const fileName = `building_${buildingId}_${storageId}.ifc`;
    const filePath = `/uploads/buildings/${buildingId}/${fileName}`;
    
    console.log(`📁 Файл сохранен: ${filePath}`);
    console.log(`📊 Размер: ${arrayBuffer.byteLength} байт`);
    console.log(`⏰ Время: ${new Date().toISOString()}`);
    
    return {
      success: true,
      filePath,
      fileSize: arrayBuffer.byteLength,
      savedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ Ошибка сохранения файла:", error);
    throw error;
  }
}
