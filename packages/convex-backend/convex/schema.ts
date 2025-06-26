import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // Проекты
  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("planning"),
      v.literal("design"),
      v.literal("construction"),
      v.literal("operation"),
      v.literal("completed")
    ),
    createdBy: v.id("users"),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    metadata: v.optional(v.object({
      location: v.optional(v.string()),
      client: v.optional(v.string()),
      budget: v.optional(v.number()),
    })),
  }).index("by_creator", ["createdBy"])
    .index("by_status", ["status"]),

  // Здания в проекте
  buildings: defineTable({
    projectId: v.id("projects"),
    name: v.string(),
    description: v.optional(v.string()),
    ifcFileId: v.optional(v.id("_storage")),
    thatOpenModelId: v.optional(v.string()),
    metadata: v.optional(v.object({
      floors: v.optional(v.number()),
      area: v.optional(v.number()),
      height: v.optional(v.number()),
    })),
  }).index("by_project", ["projectId"]),

  // Элементы здания
  buildingElements: defineTable({
    buildingId: v.id("buildings"),
    elementId: v.string(), // ID элемента в ThatOpen/IFC
    name: v.string(),
    type: v.string(), // Wall, Door, Window, etc.
    category: v.optional(v.string()),
    properties: v.object({}), // Динамические свойства элемента
    documentation: v.optional(v.array(v.object({
      title: v.string(),
      content: v.string(),
      fileId: v.optional(v.id("_storage")),
    }))),
  }).index("by_building", ["buildingId"])
    .index("by_element_id", ["elementId"])
    .index("by_type", ["type"]),

  // Замечания
  issues: defineTable({
    projectId: v.id("projects"),
    buildingId: v.optional(v.id("buildings")),
    elementIds: v.array(v.string()), // Массив ID элементов
    title: v.string(),
    description: v.string(),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("resolved"),
      v.literal("closed")
    ),
    assignedTo: v.optional(v.id("users")),
    createdBy: v.id("users"),
    dueDate: v.optional(v.number()),
    attachments: v.optional(v.array(v.id("_storage"))),
    comments: v.optional(v.array(v.object({
      authorId: v.id("users"),
      content: v.string(),
      timestamp: v.number(),
    }))),
  }).index("by_project", ["projectId"])
    .index("by_building", ["buildingId"])
    .index("by_status", ["status"])
    .index("by_assignee", ["assignedTo"])
    .index("by_creator", ["createdBy"]),

  // Участники проекта
  projectMembers: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),
    role: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("architect"),
      v.literal("engineer"),
      v.literal("contractor"),
      v.literal("viewer")
    ),
    permissions: v.array(v.string()),
  }).index("by_project", ["projectId"])
    .index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
