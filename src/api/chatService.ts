import http from "@/lib/http";

interface ChatHistory {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  messageContent: string;
  sender: "user" | "ai";
  createdAt: string;
  updatedAt: string;
}

type createChatMessageBodyType = {
  chatId: string;
  userId: string;
  messageContent: string;
  sender: "user" | "ai";
};

// Gemini API integration
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export const chatService = {
  createChatHistory: (userId: string) => {
    return http.post(`chat-history/${userId}`);
  },
  getChatHistory: (userId: string) => {
    return http
      .get<{ data: ChatHistory[] }>(`chat-history/user/${userId}`)
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
      .get<{ messages: ChatMessage[] }>(`chat-messages/chat/${chatHistoryId}`)
      .then((response) => response.payload.messages);
  },
  updateChatMessage: (messageId: string, data: createChatMessageBodyType) => {
    return http.patch(`chat-messages/${messageId}`, data);
  },
  deleteChatMessage: (messageId: string) => {
    return http.delete(`chat-messages/${messageId}`);
  },

  // Gemini AI integration
  getGeminiAIResponse: async (prompt: string): Promise<string | null> => {
    try {
      if (!GEMINI_API_KEY) {
        console.log(" GEMINI_API_KEY not found");
        return null;
      }

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      const data = await response.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (error) {
      console.error("Error calling Gemini REST API:", error);
      return null;
    }
  },

  // Send AI message to backend
  sendAIMessage: async (
    chatId: string,
    messageContent: string,
    userId: string
  ) => {
    const data: createChatMessageBodyType = {
      chatId,
      userId,
      sender: "ai",
      messageContent,
    };
    return http.post("chat-messages", data);
  },

  // Complete chat flow: send user message, get AI response, and save AI message
  sendMessageWithAIResponse: async (
    chatId: string,
    userMessage: string,
    userId: string
  ) => {
    try {
      // 1. Send user message
      await chatService.createChatMessage({
        chatId,
        userId,
        messageContent: userMessage,
        sender: "user",
      });

      // 2. Get AI response from Gemini
      const aiResponse = await chatService.getGeminiAIResponse(userMessage);

      if (aiResponse) {
        // 3. Save AI response to backend
        await chatService.sendAIMessage(chatId, aiResponse, userId);
      }

      return { success: true, aiResponse };
    } catch (error) {
      console.error("Error in complete chat flow:", error);
      throw error;
    }
  },
};
