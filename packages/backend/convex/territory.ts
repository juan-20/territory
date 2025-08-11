import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { validateToken, validateAdminRole } from "./auth";

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
    const tokenData = await validateAdminRole(ctx, args.token);
    const newTerritoryId = await ctx.db.insert("territories", {
      name: args.name,
      description: args.description,
      doneRecently: false,
      updatedAt: new Date().toISOString(),
      region: args.region,
      leastEditedBy: [tokenData.username] // Track who created the territory as array
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
    const tokenData = await validateToken(ctx, args.token);

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

    // Get current territory to manage editors array
    const currentTerritory = await ctx.db.get(args.id);
    const currentEditors = currentTerritory?.leastEditedBy || [];
    
    // Add current editor to the beginning of the array if not already the most recent
    let updatedEditors = [...currentEditors];
    if (updatedEditors[0] !== tokenData.username) {
      // Remove user if they exist elsewhere in the array
      updatedEditors = updatedEditors.filter(editor => editor !== tokenData.username);
      // Add to the beginning (most recent)
      updatedEditors.unshift(tokenData.username);
      // Keep only last 5 editors to prevent infinite growth
      updatedEditors = updatedEditors.slice(0, 5);
    }

    await ctx.db.patch(args.id, { 
      doneRecently, // Automatically calculated
      updatedAt: new Date().toISOString(), 
      description: args.description, 
      region: args.region, 
      timesWhereItWasDone: timesDone,
      leastEditedBy: updatedEditors // Track editors array
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
    await validateAdminRole(ctx, args.token);
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

export const getTerritoriesWithEditInfo = query({
  args: {
    token: v.string()
  },
  handler: async (ctx, args) => {
    await validateAdminRole(ctx, args.token);
    
    const territories = await ctx.db.query("territories").collect();
    
    return territories.map(territory => ({
      _id: territory._id,
      name: territory.name,
      description: territory.description,
      region: territory.region,
      doneRecently: territory.doneRecently,
      updatedAt: territory.updatedAt,
      leastEditedBy: territory.leastEditedBy || [],
      lastEditor: territory.leastEditedBy?.[0] || null,
      totalEditors: territory.leastEditedBy?.length || 0,
      timesWhereItWasDone: territory.timesWhereItWasDone || []
    }));
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

export const clearLastEditedBy = mutation({
  args: {
    id: v.id("territories"),
    token: v.string()
  },
  handler: async (ctx, args) => {
    await validateAdminRole(ctx, args.token);
    
    await ctx.db.patch(args.id, {
      leastEditedBy: undefined,
      updatedAt: new Date().toISOString()
    });
    
    return { success: true };
  },
});

export const clearSingleEditor = mutation({
  args: {
    id: v.id("territories"),
    editorToRemove: v.string(),
    token: v.string()
  },
  handler: async (ctx, args) => {
    await validateAdminRole(ctx, args.token);
    
    const territory = await ctx.db.get(args.id);
    if (!territory || !territory.leastEditedBy) {
      throw new Error("Território não encontrado ou sem editores para remover");
    }
    
    const updatedEditors = territory.leastEditedBy.filter(editor => editor !== args.editorToRemove);
    
    await ctx.db.patch(args.id, {
      leastEditedBy: updatedEditors.length > 0 ? updatedEditors : undefined,
      updatedAt: new Date().toISOString()
    });
    
    return { success: true };
  },
});

export const clearAllLastEditedBy = mutation({
  args: {
    token: v.string()
  },
  handler: async (ctx, args) => {
    await validateAdminRole(ctx, args.token);
    
    // Get all territories that have leastEditedBy set
    const territories = await ctx.db.query("territories")
      .filter((q) => q.neq(q.field("leastEditedBy"), undefined))
      .collect();
    
    // Clear leastEditedBy for all territories
    for (const territory of territories) {
      await ctx.db.patch(territory._id, {
        leastEditedBy: undefined,
        updatedAt: new Date().toISOString()
      });
    }
    
    return { 
      success: true, 
      clearedCount: territories.length 
    };
  },
});

export const getEditorsHistory = query({
  args: {
    id: v.id("territories"),
    token: v.string()
  },
  handler: async (ctx, args) => {
    await validateToken(ctx, args.token);
    
    const territory = await ctx.db.get(args.id);
    if (!territory) {
      throw new Error("Território não encontrado");
    }
    
    return {
      editors: territory.leastEditedBy || [],
      lastEditor: territory.leastEditedBy?.[0] || null,
      totalEditors: territory.leastEditedBy?.length || 0
    };
  },
});
