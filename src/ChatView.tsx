import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

export function ChatView() {
  const [selectedChatId, setSelectedChatId] = useState<Id<"chats"> | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [newChatName, setNewChatName] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);

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
    setShowSidebar(false); // Close sidebar on mobile after creating a chat
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handleChatSelect = (chatId: Id<"chats">) => {
    setSelectedChatId(chatId);
    setShowSidebar(false); // Close sidebar on mobile after selecting a chat
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] relative">
      {/* Mobile menu button */}
      <button
        className="md:hidden absolute top-2 left-2 z-20 p-2 bg-white rounded-md shadow-sm"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={showSidebar ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>

      {/* Sidebar */}
      <div
        className={`${showSidebar ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 w-full md:w-80 md:min-w-[20rem] border-r flex flex-col absolute md:relative z-10 bg-white transition-transform duration-300 ease-in-out h-full`}
      >
        <div className="p-3 sm:p-4 border-b">
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
              className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              +
            </button>
          </form>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <button
              key={chat._id}
              onClick={() => handleChatSelect(chat._id)}
              className={`w-full p-3 sm:p-4 text-left hover:bg-gray-50 ${selectedChatId === chat._id ? "bg-blue-50" : ""
                }`}
            >
              <h3 className="font-medium truncate">{chat.name}</h3>
              <p className="text-sm text-gray-500 truncate">
                {chat.participants.map((p) => p.name).join(", ")}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Dark overlay for mobile when sidebar is open */}
      {showSidebar && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-0"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col w-full">
        {selectedChatId ? (
          <>
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col-reverse">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`my-2 max-w-[85%] sm:max-w-lg ${message.senderId === user?._id
                    ? "ml-auto bg-blue-500 text-white"
                    : "mr-auto bg-gray-100"
                    } rounded-lg p-2 sm:p-3`}
                >
                  <p className="text-xs sm:text-sm font-medium">{message.senderName}</p>
                  <p className="text-sm sm:text-base break-words">{message.content}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handleSend} className="p-2 sm:p-4 border-t flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border rounded"
              />
              <button
                type="submit"
                className="px-4 sm:px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 p-4 text-center">
            <div>
              <p className="mb-2">Select a chat to start messaging</p>
              <button
                onClick={() => setShowSidebar(true)}
                className="md:hidden px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Open Chats
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
