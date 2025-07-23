import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { DatabaseReader } from "./_generated/server";

async function validateToken(ctx: { db: DatabaseReader }, token: string) {
  const existingToken = await ctx.db.query("token").first();
  if (!existingToken || existingToken.token !== token) {
    throw new Error("Invalid token");
  }
  return true;
}

export const initializeToken = mutation({
  args: {
    token: v.string()
  },
  handler: async (ctx, args) => {
    const existingToken = await ctx.db.query("token").first();
    
    // If no token exists yet, create it
    if (!existingToken) {
      await ctx.db.insert("token", { token: args.token });
      return true;
    }
    
    // If token exists, validate it
    if (existingToken.token !== args.token) {
      throw new Error("Token inválido");
    }
    
    return true;
  },
});

export const validateTokenQuery = query({
  args: {
    token: v.string()
  },
  handler: async (ctx, args) => {
    return await validateToken(ctx, args.token);
  },
});

export const getPaginatedTerritories = query({
  args: { 
    paginationOpts: paginationOptsValidator,
    token: v.string()
  },
  handler: async (ctx, args) => {
    await validateToken(ctx, args.token);
    return await ctx.db.query("territories")
                        .filter((q) => q.eq(q.field("done"), false))
                        .order("asc")
                        .paginate(args.paginationOpts);
  },
});

export const getSearchableTerritories = query({
  args: {
    search: v.string(),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.token) return;
    await validateToken(ctx, args.token);
    return await ctx.db.query("territories").withSearchIndex("searchIndex", (q) =>
        q.search("name", args.search)
    ).take(10);
  },
});

export const getById = query({
  args: {
    id: v.id("territories"),
    token: v.string()
  },
  handler: async (ctx, args) => {
    await validateToken(ctx, args.token);
    return await ctx.db.get(args.id);
  },
});

export const getByRegion = query({
  args: {
    region: v.string(),
    token: v.string()
  },
  handler: async (ctx, args) => {
    await validateToken(ctx, args.token);
    return await ctx.db.query("territories").filter((q) => q.eq(q.field("region"), args.region)).collect();
  },
});

export const getDoneTerritories = query({
  args: {
    token: v.string()
  },
  handler: async (ctx, args) => {
    await validateToken(ctx, args.token);
    return await ctx.db.query("territories").filter((q) => q.eq(q.field("done"), true)).collect();
  },
});

export const getUndoneTerritories = query({
  args: {
    token: v.string()
  },
  handler: async (ctx, args) => {
    await validateToken(ctx, args.token);
    return await ctx.db.query("territories").filter((q) => q.eq(q.field("done"), false)).collect();
  }
});

export const getRegions = query({
  args: {
    token: v.string()
  },
  handler: async (ctx, args) => {
    await validateToken(ctx, args.token);
    return ["Oeste", "Norte", "Sul", "Centro", "Leste"];
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    done: v.boolean(),
    region: v.string(),
    token: v.string()
  },
  handler: async (ctx, args) => {
    await validateToken(ctx, args.token);
    const newTerritoryId = await ctx.db.insert("territories", {
      name: args.name,
      description: args.description,
      done: false,
      updatedAt: new Date().toISOString(),
      region: args.region,
    });
    return await ctx.db.get(newTerritoryId);
  },
});

export const toggle = mutation({
  args: {
    id: v.id("territories"),
    done: v.boolean(),
    description: v.string(),
    region: v.string(),
    token: v.string()
  },
  handler: async (ctx, args) => {
    await validateToken(ctx, args.token);
    await ctx.db.patch(args.id, { done: args.done, updatedAt: new Date().toISOString(), description: args.description, region: args.region });
    return { success: true };
  },
});

export const deleteTerritory = mutation({
  args: {
    id: v.id("territories"),
    token: v.string()
  },
  handler: async (ctx, args) => {
    await validateToken(ctx, args.token);
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
