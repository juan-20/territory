import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  territories: defineTable({
    name: v.string(),
    description: v.string(),
    done: v.boolean(),
    updatedAt: v.string(),
    region: v.string(),
  }).searchIndex("searchIndex", {
    searchField: "name",
    filterFields: ["region"],
  }),

  token: defineTable({
    token: v.string(),
  }),
});
