import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    name: v.string(),
    participantIds: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const participants = [...new Set([...args.participantIds, userId])];
    return await ctx.db.insert("chats", {
      name: args.name,
      participants,
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const chats = await ctx.db
      .query("chats")
      .withIndex("by_participant", (q) => q.eq("participants", [userId]))
      .collect();

    return Promise.all(
      chats.map(async (chat) => {
        const participants = await Promise.all(
          chat.participants.map((id) => ctx.db.get(id))
        );
        return {
          ...chat,
          participants: participants.map((p) => ({
            id: p!._id,
            name: p?.name ?? "Unknown",
          })),
        };
      })
    );
  },
});
