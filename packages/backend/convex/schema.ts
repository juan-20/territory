import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  territories: defineTable({
    name: v.string(),
    description: v.string(),
    updatedAt: v.string(),
    region: v.string(),
    doneRecently: v.boolean(),
    timesWhereItWasDone: v.optional(v.array(v.string())),
    leastEditedBy: v.optional(v.array(v.string())),
  }).searchIndex("searchIndex", {
    searchField: "name",
    filterFields: ["region"],
  }),

  token: defineTable({
    token: v.string(),
    username: v.string(),
    role: v.string(),
  }),
});
