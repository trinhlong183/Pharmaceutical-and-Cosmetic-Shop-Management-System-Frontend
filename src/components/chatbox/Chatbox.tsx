import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/contexts/UserContext";
import { chatService } from "@/api/chatService";
import { X } from "lucide-react";

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
  const [isSending, setIsSending] = useState(false);

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
    if (!input.trim() || isSending) return;
    setIsSending(true);
    try {
      await chatService.sendMessageWithAIResponse(
        selectedChatId,
        input,
        user.id
      );
      setInput("");
      await fetchChatHistory();
    } catch (error) {
      console.error("Error sending message:", error);
      try {
        await chatService.createChatMessage({
          chatId: selectedChatId,
          userId: user.id,
          messageContent: input,
          sender: "user",
        });
        setInput("");
        await fetchChatHistory();
      } catch (fallbackError) {
        console.error("Error sending fallback message:", fallbackError);
      }
    } finally {
      setIsSending(false);
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

  // Thêm hàm parseMarkdownList để chuyển đổi * thành <ul><li>
  function parseMarkdownList(text: string) {
    const lines = text.split("\n");
    let inList = false;
    const result: React.ReactNode[] = [];
    let listItems: React.ReactNode[] = [];

    // Hàm phụ để xử lý **bold**
    function renderBold(str: string, keyPrefix: string) {
      const parts = str.split(/(\*\*[^*]+\*\*)/g);
      return parts.map((part, idx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={keyPrefix + idx}>{part.slice(2, -2)}</strong>;
        }
        return <React.Fragment key={keyPrefix + idx}>{part}</React.Fragment>;
      });
    }

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("* ")) {
        inList = true;
        listItems.push(
          <li key={idx}>{renderBold(trimmed.slice(2), `li-${idx}-`)}</li>
        );
      } else {
        if (inList && listItems.length > 0) {
          result.push(
            <ul className="list-disc ml-5" key={`ul-${idx}`}>
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        if (trimmed) {
          result.push(
            <span key={`span-${idx}`}>
              {renderBold(line, `span-${idx}-`)}
              <br />
            </span>
          );
        }
      }
    });
    if (inList && listItems.length > 0) {
      result.push(
        <ul className="list-disc ml-5" key={`ul-last`}>
          {listItems}
        </ul>
      );
    }
    return result;
  }

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-6xl w-full p-0 overflow-hidden" // tăng max-w lên 6xl
        style={{
          left: "85%",
          top: "95%",
          transform: "translate(-50%, -50%)",
          position: "fixed",
          margin: 0,
          padding: 0,
          borderRadius: 20,
          maxWidth: "70%",

          maxHeight: "95vh",
          width: "100%",
          height: "85vh", // giảm chiều cao một chút cho thoáng
          overflowY: "auto",
          background: "white",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="flex h-full">
      
          <div className="w-72 border-r bg-gray-50 flex flex-col">
         
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
            <DialogHeader className="bg-gradient-to-r from-green-500 to-teal-500 px-6 py-4 flex flex-row items-center justify-between">
              <DialogTitle className="text-white text-lg font-bold flex-1">
                Chat Support
              </DialogTitle>
              <DialogClose asChild></DialogClose>
            </DialogHeader>
            <div
              className="flex-1 px-6 py-4 bg-gray-50 overflow-y-auto"
              style={{ minHeight: 300 }} // tăng minHeight
            >
              {selectedChat?.messages.length ? (
                selectedChat.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`mb-2 flex ${
                      msg.from === "user" ? "justify-end" : "justify-start"
                    } group`}
                  >
                    <div className="relative flex items-center">
                      <div
                        className={`px-3 py-2 rounded-lg break-words mt-6 ${
                          msg.from === "user"
                            ? "bg-teal-500 text-white max-w-[620px] ml-auto"
                            : "bg-gray-200 text-gray-800 max-w-[620px] mr-auto"
                        }`}
                        style={{
                          wordBreak: "break-word",
                          whiteSpace: "normal",
                          textAlign: "left",
                          justifyContent:
                            msg.from === "user" ? "flex-end" : "flex-start",
                        }}
                      >
                        {msg.from === "ai"
                          ? parseMarkdownList(msg.text)
                          : msg.text}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-center mt-8">
                  Chat with us
                </div>
              )}
            </div>
            <form
              className="flex items-center border-t border-gray-100 bg-white px-4 py-3"
              onSubmit={handleSend}
            >
              <Textarea
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none max-h-32 overflow-y-auto break-words whitespace-pre-wrap w-full"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={2}
                disabled={isSending}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e as any);
                  }
                }}
              />
              <Button
                type="submit"
                className="ml-3 px-6 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white font-medium hover:from-green-600 hover:to-teal-600 flex items-center"
                disabled={isSending}
              >
                {isSending ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    Sending...
                  </>
                ) : (
                  "Send"
                )}
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
    </Dialog>
  );
}
