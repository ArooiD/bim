import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

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

// Внутренняя функция для обновления ThatOpen модели здания
export const updateThatOpenModel = internalMutation({
  args: {
    buildingId: v.id("buildings"),
    modelId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.buildingId, {
      thatOpenModelId: args.modelId,
    });
  },
});
