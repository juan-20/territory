import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { DatabaseReader } from "./_generated/server";

async function validateToken(ctx: { db: DatabaseReader }, token: string) {
  const existingToken = await ctx.db.query("token").filter((q) => q.eq(q.field("token"), token)).first();
  if (!existingToken) {
    throw new Error("Token inválido. Por favor, verifique e tente novamente.");
  }
  return existingToken;
}

async function validateAdminRole(ctx: { db: DatabaseReader }, token: string) {
  const tokenData = await validateToken(ctx, token);
  if (tokenData.role !== "ADMIN") {
    throw new Error("Acesso negado. Apenas administradores podem realizar esta ação.");
  }
  return tokenData;
}

export const initializeToken = mutation({
  args: {
    token: v.string(),
    username: v.string(),
    role: v.union(v.literal("ADMIN"), v.literal("USER"))
  },
  handler: async (ctx, args) => {
    const existingToken = await ctx.db.query("token").first();
    
    // If no token exists yet, create it
    if (!existingToken) {
      await ctx.db.insert("token", { 
        token: args.token, 
        username: args.username, 
        role: args.role 
      });
      return true;
    }
    
    // If token exists, validate it
    if (existingToken.token !== args.token) {
      throw new Error("Token inválido. Por favor, verifique e tente novamente.");
    }
    
    return true;
  },
});

export const loginWithToken = mutation({
  args: {
    token: v.string()
  },
  handler: async (ctx, args) => {
    // Check if any users exist in the system
    const allUsers = await ctx.db.query("token").collect();
    
    // If no users exist, create the first admin user with the provided token
    if (allUsers.length === 0) {
      const newUserId = await ctx.db.insert("token", {
        token: args.token,
        username: "Administrador",
        role: "ADMIN"
      });
      
      const newUser = await ctx.db.get(newUserId);
      return {
        success: true,
        user: {
          username: newUser!.username,
          role: newUser!.role,
          isAdmin: true
        },
        isFirstUser: true
      };
    }
    
    // Check if token exists in database
    const existingToken = await ctx.db.query("token").filter((q) => q.eq(q.field("token"), args.token)).first();
    
    if (!existingToken) {
      throw new Error("Token inválido. Por favor, verifique se o token está correto ou entre em contato com o administrador.");
    }
    
    return {
      success: true,
      user: {
        username: existingToken.username,
        role: existingToken.role,
        isAdmin: existingToken.role === "ADMIN"
      },
      isFirstUser: false
    };
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

export const getTokenInfo = query({
  args: {
    token: v.string()
  },
  handler: async (ctx, args) => {
    const tokenData = await validateToken(ctx, args.token);
    return {
      username: tokenData.username,
      role: tokenData.role,
      isAdmin: tokenData.role === "ADMIN"
    };
  },
});

export const getAllUsers = query({
  args: {
    token: v.string()
  },
  handler: async (ctx, args) => {
    await validateAdminRole(ctx, args.token);
    return await ctx.db.query("token").collect();
  },
});

export const updateTokenInfo = mutation({
  args: {
    token: v.string(),
    username: v.optional(v.string()),
    role: v.optional(v.union(v.literal("ADMIN"), v.literal("USER")))
  },
  handler: async (ctx, args) => {
    const tokenData = await validateToken(ctx, args.token);
    
    // Only admins can change roles
    if (args.role && tokenData.role !== "ADMIN") {
      throw new Error("Apenas administradores podem alterar funções de usuário.");
    }
    
    const updateData: any = {};
    if (args.username) updateData.username = args.username;
    if (args.role) updateData.role = args.role;
    
    if (Object.keys(updateData).length > 0) {
      await ctx.db.patch(tokenData._id, updateData);
    }
    
    return { success: true };
  },
});

export const createUser = mutation({
  args: {
    token: v.string(),
    newUserToken: v.string(),
    username: v.string(),
    role: v.union(v.literal("ADMIN"), v.literal("USER"))
  },
  handler: async (ctx, args) => {
    await validateAdminRole(ctx, args.token);
    
    // Check if user token already exists
    const existingUser = await ctx.db.query("token").filter((q) => q.eq(q.field("token"), args.newUserToken)).first();
    if (existingUser) {
      throw new Error("Este token já está em uso. Por favor, escolha outro token.");
    }
    
    // Create new user
    const newUserId = await ctx.db.insert("token", {
      token: args.newUserToken,
      username: args.username,
      role: args.role
    });
    
    const newUser = await ctx.db.get(newUserId);
    return newUser;
  },
});

// Export helper functions for use in other files
export { validateToken, validateAdminRole };
