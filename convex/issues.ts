import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Получить замечания проекта
export const getProjectIssues = query({
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

    const issues = await ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Добавляем информацию о создателе и исполнителе
    return await Promise.all(
      issues.map(async (issue) => {
        const creator = await ctx.db.get(issue.createdBy);
        const assignee = issue.assignedTo ? await ctx.db.get(issue.assignedTo) : null;
        
        return {
          ...issue,
          creator: creator ? { name: creator.name, email: creator.email } : null,
          assignee: assignee ? { name: assignee.name, email: assignee.email } : null,
        };
      })
    );
  },
});

// Создать замечание
export const createIssue = mutation({
  args: {
    projectId: v.id("projects"),
    buildingId: v.optional(v.id("buildings")),
    elementIds: v.array(v.string()),
    title: v.string(),
    description: v.string(),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
    assignedTo: v.optional(v.id("users")),
    dueDate: v.optional(v.number()),
  },
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

    return await ctx.db.insert("issues", {
      projectId: args.projectId,
      buildingId: args.buildingId,
      elementIds: args.elementIds,
      title: args.title,
      description: args.description,
      priority: args.priority,
      status: "open",
      assignedTo: args.assignedTo,
      createdBy: userId,
      dueDate: args.dueDate,
    });
  },
});

// Обновить статус замечания
export const updateIssueStatus = mutation({
  args: {
    issueId: v.id("issues"),
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("resolved"),
      v.literal("closed")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Не авторизован");
    }

    const issue = await ctx.db.get(args.issueId);
    if (!issue) {
      throw new Error("Замечание не найдено");
    }

    // Проверяем права (создатель, исполнитель или админ проекта)
    const membership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", issue.projectId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    const canUpdate = 
      issue.createdBy === userId ||
      issue.assignedTo === userId ||
      (membership && ["owner", "admin"].includes(membership.role));

    if (!canUpdate) {
      throw new Error("Недостаточно прав");
    }

    await ctx.db.patch(args.issueId, {
      status: args.status,
    });
  },
});

// Добавить комментарий к замечанию
export const addIssueComment = mutation({
  args: {
    issueId: v.id("issues"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Не авторизован");
    }

    const issue = await ctx.db.get(args.issueId);
    if (!issue) {
      throw new Error("Замечание не найдено");
    }

    // Проверяем доступ к проекту
    const membership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", issue.projectId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!membership) {
      throw new Error("Нет доступа к проекту");
    }

    const newComment = {
      authorId: userId,
      content: args.content,
      timestamp: Date.now(),
    };

    const currentComments = issue.comments || [];
    
    await ctx.db.patch(args.issueId, {
      comments: [...currentComments, newComment],
    });
  },
});
