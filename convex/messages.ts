import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const send = mutation({
  args: {
    content: v.string(),
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const chat = await ctx.db.get(args.chatId);
    if (!chat) throw new Error("Chat not found");
    if (!chat.participants.includes(userId)) throw new Error("Not a participant");

    await ctx.db.insert("messages", {
      content: args.content,
      senderId: userId,
      chatId: args.chatId,
    });
  },
});

export const list = query({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const chat = await ctx.db.get(args.chatId);
    if (!chat) throw new Error("Chat not found");
    if (!chat.participants.includes(userId)) throw new Error("Not a participant");

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("desc")
      .collect();

    return Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        return {
          ...message,
          senderName: sender?.name ?? "Unknown",
        };
      })
    );
  },
});
