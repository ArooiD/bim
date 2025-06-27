import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Получить все проекты пользователя
export const getUserProjects = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Не авторизован");
    }

    // Получаем проекты где пользователь является участником
    const memberships = await ctx.db
      .query("projectMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const projects = await Promise.all(
      memberships.map(async (membership) => {
        const project = await ctx.db.get(membership.projectId);
        return project ? { ...project, role: membership.role } : null;
      })
    );

    return projects.filter(Boolean);
  },
});

// Создать новый проект
export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    startDate: v.number(),
    metadata: v.optional(v.object({
      location: v.optional(v.string()),
      client: v.optional(v.string()),
      budget: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Не авторизован");
    }

    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      status: "planning",
      createdBy: userId,
      startDate: args.startDate,
      metadata: args.metadata,
    });

    // Добавляем создателя как владельца проекта
    await ctx.db.insert("projectMembers", {
      projectId,
      userId,
      role: "owner",
      permissions: ["read", "write", "admin"],
    });

    return projectId;
  },
});

// Получить детали проекта
export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Не авторизован");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Проект не найден");
    }

    // Проверяем доступ к проекту
    const membership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!membership) {
      // Если пользователь создатель проекта, даем доступ
      if (project.createdBy === userId) {
        return { ...project, userRole: "owner" };
      }
      throw new Error("Нет доступа к проекту");
    }

    return { ...project, userRole: membership.role };
  },
});

// Обновить статус проекта
export const updateProjectStatus = mutation({
  args: {
    projectId: v.id("projects"),
    status: v.union(
      v.literal("planning"),
      v.literal("design"),
      v.literal("construction"),
      v.literal("operation"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Не авторизован");
    }

    // Проверяем права на изменение
    const membership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      throw new Error("Недостаточно прав");
    }

    await ctx.db.patch(args.projectId, {
      status: args.status,
    });
  },
});

// Исправить отсутствующие записи в projectMembers
export const fixProjectMemberships = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Не авторизован");

    const userProjects = await ctx.db
      .query("projects")
      .withIndex("by_creator", (q) => q.eq("createdBy", userId))
      .collect();

    let fixed = 0;
    for (const project of userProjects) {
      const membership = await ctx.db
        .query("projectMembers")
        .withIndex("by_project", (q) => q.eq("projectId", project._id))
        .filter((q) => q.eq(q.field("userId"), userId))
        .first();

      if (!membership) {
        await ctx.db.insert("projectMembers", {
          projectId: project._id,
          userId,
          role: "owner",
          permissions: ["read", "write", "admin"],
        });
        fixed++;
      }
    }

    return { message: `Исправлено ${fixed} проектов` };
  },
});
