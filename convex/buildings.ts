import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

// Получить здания проекта
export const getProjectBuildings = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Не авторизован");
    }

    // Проверяем доступ к проекту
    const membership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!membership) {
      throw new Error("Нет доступа к проекту");
    }

    return await ctx.db
      .query("buildings")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

// Создать здание
export const createBuilding = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    description: v.optional(v.string()),
    metadata: v.optional(v.object({
      floors: v.optional(v.number()),
      area: v.optional(v.number()),
      height: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Не авторизован");
    }

    // Проверяем права на создание
    const membership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!membership || !["owner", "admin", "architect"].includes(membership.role)) {
      throw new Error("Недостаточно прав");
    }

    return await ctx.db.insert("buildings", {
      projectId: args.projectId,
      name: args.name,
      description: args.description,
      metadata: args.metadata,
    });
  },
});

// Получить детали здания
export const getBuilding = query({
  args: { buildingId: v.id("buildings") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Не авторизован");
    }

    const building = await ctx.db.get(args.buildingId);
    if (!building) {
      throw new Error("Здание не найдено");
    }

    // Проверяем доступ к проекту
    const membership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", building.projectId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!membership) {
      throw new Error("Нет доступа к зданию");
    }

    return building;
  },
});

// Получить элементы здания
export const getBuildingElements = query({
  args: { buildingId: v.id("buildings") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Не авторизован");
    }

    const building = await ctx.db.get(args.buildingId);
    if (!building) {
      throw new Error("Здание не найдено");
    }

    // Проверяем доступ к проекту
    const membership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", building.projectId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!membership) {
      throw new Error("Нет доступа к зданию");
    }

    return await ctx.db
      .query("buildingElements")
      .withIndex("by_building", (q) => q.eq("buildingId", args.buildingId))
      .collect();
  },
});

// Генерировать URL для загрузки IFC файла
export const generateIfcUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Не авторизован");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

// Обновить IFC файл здания
export const updateBuildingIfc = mutation({
  args: {
    buildingId: v.id("buildings"),
    ifcFileId: v.id("_storage"),
    fileName: v.string(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Не авторизован");
    }

    const building = await ctx.db.get(args.buildingId);
    if (!building) {
      throw new Error("Здание не найдено");
    }

    await ctx.db.patch(args.buildingId, {
      ifcFileId: args.ifcFileId,
    });

    // Записываем информацию о файле
    await ctx.db.insert("buildingFiles", {
      buildingId: args.buildingId,
      storageId: args.ifcFileId,
      fileName: args.fileName,
      fileType: "ifc",
      fileSize: args.fileSize,
      uploadedBy: userId,
      status: "processing",
    });

    // Запускаем обработку IFC файла
    await ctx.scheduler.runAfter(0, api.ifcProcessor.processIfcFile, {
      buildingId: args.buildingId,
      ifcFileId: args.ifcFileId,
    });
  },
});

// Внутренняя функция для создания элемента здания
export const insertBuildingElement = internalMutation({
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
  handler: async (ctx, args) => {
    return await ctx.db.insert("buildingElements", {
      buildingId: args.buildingId,
      elementId: args.elementId,
      name: args.name,
      type: args.type,
      category: args.category,
      properties: args.properties,
      documentation: args.documentation,
    });
  },
});

// Получить информацию о загруженных файлах здания
export const getBuildingFiles = query({
  args: { buildingId: v.id("buildings") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Не авторизован");
    }

    const building = await ctx.db.get(args.buildingId);
    if (!building) {
      throw new Error("Здание не найдено");
    }

    const files = await ctx.db
      .query("buildingFiles")
      .withIndex("by_building", (q) => q.eq("buildingId", args.buildingId))
      .order("desc")
      .collect();

    return files;
  },
});

// Получить статистику обработки файлов
export const getFileProcessingStats = query({
  args: { buildingId: v.id("buildings") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Не авторизован");
    }

    const files = await ctx.db
      .query("buildingFiles")
      .withIndex("by_building", (q) => q.eq("buildingId", args.buildingId))
      .collect();

    const stats = {
      total: files.length,
      uploading: files.filter(f => f.status === "uploading").length,
      processing: files.filter(f => f.status === "processing").length,
      completed: files.filter(f => f.status === "completed").length,
      error: files.filter(f => f.status === "error").length,
    };

    return stats;
  },
});

// Тестовая функция для принудительного запуска обработки
export const testProcessFile = mutation({
  args: { buildingId: v.id("buildings") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Не авторизован");
    }

    // Находим последний загруженный файл
    const file = await ctx.db
      .query("buildingFiles")
      .withIndex("by_building", (q) => q.eq("buildingId", args.buildingId))
      .order("desc")
      .first();

    if (!file) {
      throw new Error("Нет файлов для обработки");
    }

    // Запускаем обработку
    await ctx.scheduler.runAfter(0, api.ifcProcessor.processIfcFile, {
      buildingId: args.buildingId,
      ifcFileId: file.storageId,
    });

    return { message: "Обработка запущена" };
  },
});

// Обновить статус файла
export const updateFileStatus = internalMutation({
  args: {
    buildingId: v.id("buildings"),
    storageId: v.id("_storage"),
    status: v.union(
      v.literal("uploading"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("error")
    ),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db
      .query("buildingFiles")
      .withIndex("by_building", (q) => q.eq("buildingId", args.buildingId))
      .filter((q) => q.eq(q.field("storageId"), args.storageId))
      .first();
    
    if (file) {
      await ctx.db.patch(file._id, {
        status: args.status,
        processedAt: args.status === "completed" ? Date.now() : undefined,
        errorMessage: args.errorMessage,
      });
    }
  },
});
