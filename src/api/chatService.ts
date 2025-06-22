import http from "@/lib/http";

type createChatMessageBodyType = {
  chatId: string;
  userId: string;
  messageContent: string;
  sender: "user" | "ai";
};

export const chatService = {
  createChatHistory: (userId: string) => {
    return http.post(`chat-history/${userId}`);
  },
  getChatHistory: (userId: string) => {
    return http
      .get<{ data: any[] }>(`chat-history/user/${userId}`)
      .then((response) => response.payload.data);
  },
  deleteChatHistory: (chatId: string) => {
    return http.delete(`chat-history/${chatId}`);
  },

  createChatMessage: (data: createChatMessageBodyType) => {
    return http.post("chat-messages", data);
  },
  getAllChatMessages: (chatHistoryId: string) => {
    return http
      .get<{ messages: any[] }>(`chat-messages/chat/${chatHistoryId}`)
      .then((response) => response.payload.messages);
  },
  updateChatMessage: (messageId: string, data: createChatMessageBodyType) => {
    return http.patch(`chat-messages/${messageId}`, data);
  },
  deleteChatMessage: (messageId: string) => {
    return http.delete(`chat-messages/${messageId}`);
  },
};
