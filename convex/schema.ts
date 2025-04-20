import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const applicationTables = {
  messages: defineTable({
    content: v.string(),
    senderId: v.id("users"),
    chatId: v.id("chats"),
  }).index("by_chat", ["chatId"]),

  chats: defineTable({
    name: v.string(),
    participants: v.array(v.id("users")),
  }).index("by_participant", ["participants"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
