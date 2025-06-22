import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { chatService } from "@/api/chatService";
import { X, Edit2, Trash2, Check, XCircle } from "lucide-react";

interface ChatboxProps {
  open: boolean;
  onClose: () => void;
}

interface Chat {
  id: string;
  title: string;
  messages: { id: string; text: string; from: "user" | "ai" }[];
}

export default function Chatbox({ open, onClose }: ChatboxProps) {
  const { user } = useUser();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string>("1");
  const [input, setInput] = useState("");
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState<string>("");
  const [confirmDeleteMsgId, setConfirmDeleteMsgId] = useState<string | null>(
    null
  );

  // Sửa lại fetchChatHistory để map data trả về thành Chat[]
  const fetchChatHistory = async () => {
    if (!user) return;
    try {
      const response = await chatService.getChatHistory(user.id);
      const mappedChats: Chat[] = (response || []).map(
        (item: any, idx: number) => ({
          id: item._id,
          title: `Support #${idx + 1}`,
          messages: (item.messages || []).map((msg: any) => ({
            id: msg._id,
            text: msg.messageContent,
            from: msg.sender,
          })),
        })
      );
      setChats(mappedChats);
      if (mappedChats.length > 0) {
        const stillExists = mappedChats.some((c) => c.id === selectedChatId);
        if (!stillExists) {
          setSelectedChatId(mappedChats[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, [user]);

  const selectedChat = chats.find((c) => c.id === selectedChatId);

  const handleNewChat = async () => {
    try {
      await chatService.createChatHistory(user.id);
      await fetchChatHistory();
    } catch (error) {
      console.error("Error creating new chat history:", error);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      await chatService.createChatMessage({
        chatId: selectedChatId,
        userId: user.id,
        messageContent: input,
        sender: "user",
      });
      setInput("");
      await fetchChatHistory();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      await chatService.deleteChatHistory(chatId);
      setChats((prev) => {
        const filtered = prev.filter((c) => c.id !== chatId);
        if (filtered.length > 0 && chatId === selectedChatId) {
          setSelectedChatId(filtered[0].id);
        }
        return filtered;
      });
      fetchChatHistory();
      setConfirmDeleteId(null);
    } catch (error) {
      console.error("Error deleting chat history:", error);
    }
  };

  // Cập nhật tin nhắn
  const handleUpdateMessage = async (msgId: string) => {
    try {
      const chat = chats.find((c) => c.id === selectedChatId);
      const msg = chat?.messages.find((m) => m.id === msgId);
      if (!msg) return;
      await chatService.updateChatMessage(msgId, {
        chatId: selectedChatId,
        userId: user.id,
        messageContent: editInput,
        sender: "user",
      });
      setEditingMsgId(null);
      setEditInput("");
      await fetchChatHistory();
    } catch (error) {
      console.error("Error updating message:", error);
    }
  };

  // Xóa tin nhắn
  const handleDeleteMessage = async (msgId: string) => {
    try {
      await chatService.deleteChatMessage(msgId);
      setConfirmDeleteMsgId(null);
      await fetchChatHistory();
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-4xl w-full p-0 overflow-hidden"
        style={{ minWidth: 700 }}
      >
        <div className="flex h-[400px]">
          {/* Left: Chat history & new chat */}
          <div className="w-56 border-r bg-gray-50 flex flex-col">
            <div className="p-3 border-b flex items-center justify-between">
              <span className="font-semibold text-gray-700">Chats</span>
              <Button size="sm" variant="outline" onClick={handleNewChat}>
                +
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`px-4 py-3 cursor-pointer border-b text-sm flex items-center justify-between ${
                    chat.id === selectedChatId
                      ? "bg-teal-100 font-bold"
                      : "hover:bg-gray-100"
                  }`}
                  onMouseEnter={() => setHoveredChatId(chat.id)}
                  onMouseLeave={() => setHoveredChatId(null)}
                >
                  <span
                    className="flex-1"
                    onClick={() => setSelectedChatId(chat.id)}
                  >
                    {chat.title}
                  </span>
                  {hoveredChatId === chat.id && (
                    <button
                      className="ml-2 text-gray-400 hover:text-red-500"
                      title="Delete chat"
                      onClick={() => setConfirmDeleteId(chat.id)}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* Right: Chat window */}
          <div className="flex-1 flex flex-col min-w-0">
            <DialogHeader className="bg-gradient-to-r from-green-500 to-teal-500 px-4 py-3 flex flex-row items-center justify-between">
              <DialogTitle className="text-white text-lg font-bold flex-1">
                Chat Support
              </DialogTitle>
              <DialogClose asChild></DialogClose>
            </DialogHeader>
            <div
              className="flex-1 px-4 py-3 bg-gray-50 overflow-y-auto"
              style={{ minHeight: 250 }}
            >
              {selectedChat?.messages.length ? (
                selectedChat.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`mb-2 flex ${
                      msg.from === "user" ? "justify-end" : "justify-start"
                    } group`}
                    onMouseEnter={() => setHoveredMsgId(msg.id)}
                    onMouseLeave={() => setHoveredMsgId(null)}
                  >
                    {editingMsgId === msg.id ? (
                      <form
                        className="flex items-center gap-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleUpdateMessage(msg.id);
                        }}
                      >
                        <input
                          className="px-2 py-1 rounded border border-gray-300"
                          value={editInput}
                          onChange={(e) => setEditInput(e.target.value)}
                          autoFocus
                        />
                        <button type="submit" className="text-green-600">
                          <Check size={16} />
                        </button>
                        <button
                          type="button"
                          className="text-gray-400 hover:text-red-500"
                          onClick={() => {
                            setEditingMsgId(null);
                            setEditInput("");
                          }}
                        >
                          <XCircle size={16} />
                        </button>
                      </form>
                    ) : (
                      <div className="relative flex items-center">
                        {msg.from === "user" && hoveredMsgId === msg.id && (
                          <div className="flex gap-1 mr-4">
                            <button
                              className="text-blue-500 hover:text-blue-700"
                              title="Edit"
                              onClick={() => {
                                setEditingMsgId(msg.id);
                                setEditInput(msg.text);
                              }}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="text-red-400 hover:text-red-600"
                              title="Delete"
                              onClick={() => setConfirmDeleteMsgId(msg.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                        <div
                          className={`px-3 py-2 rounded-lg ${
                            msg.from === "user"
                              ? "bg-teal-500 text-white"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-center mt-8">
                  Chat with us
                </div>
              )}
            </div>
            <form
              className="flex items-center border-t border-gray-100 bg-white px-3 py-2"
              onSubmit={handleSend}
            >
              <input
                type="text"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <Button
                type="submit"
                className="ml-2 bg-gradient-to-r from-green-500 to-teal-500 text-white font-medium hover:from-green-600 hover:to-teal-600"
              >
                Send
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
      {/* Modal xác nhận xóa chat */}
      {confirmDeleteId && (
        <Dialog open={true} onOpenChange={() => setConfirmDeleteId(null)}>
          <DialogContent className="max-w-xs w-full">
            <DialogHeader>
              <DialogTitle>Delete chat?</DialogTitle>
            </DialogHeader>
            <div className="py-2">
              Are you sure you want to delete this chat?
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteChat(confirmDeleteId)}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {/* Modal xác nhận xóa tin nhắn */}
      {confirmDeleteMsgId && (
        <Dialog open={true} onOpenChange={() => setConfirmDeleteMsgId(null)}>
          <DialogContent className="max-w-xs w-full">
            <DialogHeader>
              <DialogTitle>Delete message?</DialogTitle>
            </DialogHeader>
            <div className="py-2">
              Are you sure you want to delete this message?
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setConfirmDeleteMsgId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteMessage(confirmDeleteMsgId)}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}
