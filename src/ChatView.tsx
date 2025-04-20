import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

export function ChatView() {
  const [selectedChatId, setSelectedChatId] = useState<Id<"chats"> | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [newChatName, setNewChatName] = useState("");
  
  const chats = useQuery(api.chats.list) ?? [];
  const messages = useQuery(api.messages.list, selectedChatId ? { chatId: selectedChatId } : "skip") ?? [];
  const sendMessage = useMutation(api.messages.send);
  const createChat = useMutation(api.chats.create);
  const user = useQuery(api.auth.loggedInUser);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatId || !newMessage.trim()) return;
    
    await sendMessage({
      content: newMessage,
      chatId: selectedChatId,
    });
    setNewMessage("");
  };

  const handleCreateChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatName.trim()) return;
    
    const chatId = await createChat({
      name: newChatName,
      participantIds: [],
    });
    setNewChatName("");
    setSelectedChatId(chatId);
  };

  return (
    <div className="flex h-[calc(100vh-5rem)]">
      {/* Sidebar */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b">
          <form onSubmit={handleCreateChat} className="flex gap-2">
            <input
              type="text"
              value={newChatName}
              onChange={(e) => setNewChatName(e.target.value)}
              placeholder="New chat name..."
              className="flex-1 px-3 py-2 border rounded"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              +
            </button>
          </form>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <button
              key={chat._id}
              onClick={() => setSelectedChatId(chat._id)}
              className={`w-full p-4 text-left hover:bg-gray-50 ${
                selectedChatId === chat._id ? "bg-blue-50" : ""
              }`}
            >
              <h3 className="font-medium">{chat.name}</h3>
              <p className="text-sm text-gray-500">
                {chat.participants.map((p) => p.name).join(", ")}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChatId ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`my-2 max-w-lg ${
                    message.senderId === user?._id
                      ? "ml-auto bg-blue-500 text-white"
                      : "mr-auto bg-gray-100"
                  } rounded-lg p-3`}
                >
                  <p className="text-sm font-medium">{message.senderName}</p>
                  <p>{message.content}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border rounded"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
