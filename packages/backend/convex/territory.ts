import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import type { DatabaseReader } from "./_generated/server";

async function validateToken(ctx: { db: DatabaseReader }, token: string) {
  const existingToken = await ctx.db.query("token").first();
  if (!existingToken || existingToken.token !== token) {
    throw new Error("Token inválido. Por favor, verifique e tente novamente.");
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
      throw new Error("Token inválido. Por favor, verifique e tente novamente.");
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
    token: v.string(),
    filterByDoneRecently: v.optional(v.union(v.boolean(), v.null()))
  },
  handler: async (ctx, args) => {
    await validateToken(ctx, args.token);
    let query = ctx.db.query("territories");
    
    // Only apply filter if filterByDoneRecently is not null
    if (args.filterByDoneRecently !== null && args.filterByDoneRecently !== undefined) {
      query = query.filter((q) => q.eq(q.field("doneRecently"), args.filterByDoneRecently));
    }
    
    return await query
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

export const getAll = query({
  args: {
    token: v.string()
  },
  handler: async (ctx, args) => {
    await validateToken(ctx, args.token);
    return await ctx.db.query("territories").collect();
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

export const getdoneRecentlyTerritories = query({
  args: {
    token: v.string()
  },
  handler: async (ctx, args) => {
    await validateToken(ctx, args.token);
    return await ctx.db.query("territories").filter((q) => q.eq(q.field("doneRecently"), true)).collect();
  },
});

export const getUndoneRecentlyTerritories = query({
  args: {
    token: v.string()
  },
  handler: async (ctx, args) => {
    await validateToken(ctx, args.token);
    return await ctx.db.query("territories").filter((q) => q.eq(q.field("doneRecently"), false)).collect();
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
    doneRecently: v.boolean(),
    region: v.string(),
    token: v.string()
  },
  handler: async (ctx, args) => {
    await validateToken(ctx, args.token);
    const newTerritoryId = await ctx.db.insert("territories", {
      name: args.name,
      description: args.description,
      doneRecently: false,
      updatedAt: new Date().toISOString(),
      region: args.region,
    });
    return await ctx.db.get(newTerritoryId);
  },
});

export const toggle = mutation({
  args: {
    id: v.id("territories"),
    description: v.string(),
    region: v.string(),
    token: v.string(),
    timesWhereItWasDone: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    await validateToken(ctx, args.token);

    const processDate = (dateStr: string): string | null => {
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return null;
        
        date.setUTCHours(12, 0, 0, 0);
        return date.toISOString();
      } catch {
        return null;
      }
    };

    const timesDone = args.timesWhereItWasDone ? 
      args.timesWhereItWasDone
        .split(",")
        .map(date => processDate(date.trim()))
        .filter((date): date is string => date !== null)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      : [];
    
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const doneRecently = timesDone.some(dateStr => {
      const date = new Date(dateStr);
      return date >= oneYearAgo;
    });

    await ctx.db.patch(args.id, { 
      doneRecently, // Automatically calculated
      updatedAt: new Date().toISOString(), 
      description: args.description, 
      region: args.region, 
      timesWhereItWasDone: timesDone
    });
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

export const doneTerritories = query({
  args: {
    token: v.string()
  },
  handler: async (ctx, args) => {
    await validateToken(ctx, args.token);
    // Count all territories
    const territories = await ctx.db.query("territories").collect();
    const totalCount = territories.length;
    // Count territories done in the last year
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const doneRecentlyCount = territories.filter(territory => {
      const lastDoneDate = territory.timesWhereItWasDone?.[0];
      if (!lastDoneDate) return false;
      const date = new Date(lastDoneDate);
      return date >= oneYearAgo;
    }).length;
    return { "totalCount": totalCount, "doneRecentlyCount": doneRecentlyCount };
  },
});

export const updateDoneTerritories = mutation({
  args: {
    token: v.string()
  },
  handler: async (ctx, args) => {
    await validateToken(ctx, args.token);
    // Update logic here
  },
});
