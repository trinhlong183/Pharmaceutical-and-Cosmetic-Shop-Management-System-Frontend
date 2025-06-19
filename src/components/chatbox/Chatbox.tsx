import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ChatboxProps {
  open: boolean;
  onClose: () => void;
}

interface Chat {
  id: string;
  title: string;
  messages: { id: string; text: string; from: "user" | "bot" }[];
}

export default function Chatbox({ open, onClose }: ChatboxProps) {
  // Dummy chat history
  const [chats, setChats] = useState<Chat[]>([
    {
      id: "1",
      title: "Support #1",
      messages: [{ id: "m1", text: "Hello, how can I help?", from: "bot" }],
    },
    {
      id: "2",
      title: "Support #2",
      messages: [{ id: "m2", text: "Hi, I need help!", from: "user" }],
    },
  ]);
  const [selectedChatId, setSelectedChatId] = useState<string>("1");
  const [input, setInput] = useState("");

  const selectedChat = chats.find((c) => c.id === selectedChatId);

  const handleNewChat = () => {
    const newId = (chats.length + 1).toString();
    const newChat: Chat = {
      id: newId,
      title: `Support #${newId}`,
      messages: [],
    };
    setChats([newChat, ...chats]);
    setSelectedChatId(newId);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === selectedChatId
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                { id: Date.now().toString(), text: input, from: "user" },
              ],
            }
          : chat
      )
    );
    setInput("");
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-3xl w-full p-0 overflow-hidden" 
        style={{ minWidth: 700 }} 
      >
        <div className="flex h-[400px]">
          {/* Left: Chat history & new chat */}
          <div className="w-56 border-r bg-gray-50 flex flex-col">
            <div className="p-3 border-b flex items-center justify-between">
              <span className="font-semibold text-gray-700">Chats 333</span>
              <Button size="sm" variant="outline" onClick={handleNewChat}>
                +
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`px-4 py-3 cursor-pointer border-b text-sm ${
                    chat.id === selectedChatId
                      ? "bg-teal-100 font-bold"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedChatId(chat.id)}
                >
                  {chat.title}
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
                    }`}
                  >
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
                ))
              ) : (
                <div className="text-gray-500 text-center mt-8">
                  This is a demo chat interface.
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
    </Dialog>
  );
}
