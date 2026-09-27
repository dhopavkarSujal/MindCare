import {
  useEffect,
  useState,
} from "react";

import AppLayout from "../components/layout/AppLayout";

import ConversationSidebar from "../components/chat/ConversationSidebar";
import ChatWindow from "../components/chat/ChatWindow";

import {
  getConversations,
  getConversation,
  createConversation,
  deleteConversation,
} from "../services/conversation.service";

import {
  sendMessage,
} from "../services/chat.service";

const initialMessage = {
  id: "welcome-message",
  role: "assistant",
  content:
    "Hi, I'm MindCare. I'm here to listen. What would you like to talk about?",
};

export default function Chat() {

  const [conversations, setConversations] =
    useState([]);

  const [
    selectedConversation,
    setSelectedConversation,
  ] = useState(null);

  const [messages, setMessages] =
    useState([]);

  const [loadingConversations, setLoadingConversations] =
    useState(true);

  const [loadingMessages, setLoadingMessages] =
    useState(false);

  const [isTyping, setIsTyping] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * Load conversation list
   */
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoadingConversations(true);
      setError("");

      const response =
        await getConversations();

      console.log(
        "GET /api/conversations:",
        response
      );

      const data =
        response?.data ??
        response ??
        [];

      setConversations(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {
      console.error(
        "Failed to load conversations:",
        error
      );

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load conversations."
      );

    } finally {
      setLoadingConversations(false);
    }
  };

  /*
   * Open conversation
   */
  const handleSelectConversation =
    async (conversation) => {

      try {
        setSelectedConversation(
          conversation
        );

        setLoadingMessages(true);
        setError("");

        const response =
          await getConversation(
            conversation.id
          );

        console.log(
          "GET conversation:",
          response
        );

        const data =
          response?.data ??
          response;

        /*
         * Adjust this according to your
         * actual backend response shape.
         */
        const loadedMessages =
          data?.messages ??
          [];

        setMessages(
          loadedMessages.length
            ? loadedMessages
            : [initialMessage]
        );

      } catch (error) {

        console.error(
          "Failed to load conversation:",
          error
        );

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to load conversation."
        );

        setMessages([
          initialMessage,
        ]);

      } finally {
        setLoadingMessages(false);
      }
    };

  /*
   * Create new conversation
   */
  const handleNewConversation =
    async () => {

      try {
        setError("");

        const response =
          await createConversation({
            title:
              "New Support Session",
          });

        console.log(
          "POST /api/conversations:",
          response
        );

        const newConversation =
          response?.data ??
          response;

        setConversations((prev) => [
          newConversation,
          ...prev,
        ]);

        setSelectedConversation(
          newConversation
        );

        setMessages([
          initialMessage,
        ]);

      } catch (error) {
      console.error("Failed to create conversation:", error);

      console.error("Status:", error?.response?.status);

      console.error("Backend response:", error?.response?.data);

      setError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Unable to create conversation."
      );
    }
  };

  /*
   * Delete conversation
   */
  const handleDeleteConversation =
    async (conversationId) => {

      try {

        await deleteConversation(
          conversationId
        );

        setConversations((prev) =>
          prev.filter(
            (conversation) =>
              conversation.id !==
              conversationId
          )
        );

        if (
          selectedConversation?.id ===
          conversationId
        ) {
          setSelectedConversation(
            null
          );

          setMessages([]);
        }

      } catch (error) {

        console.error(
          "Failed to delete conversation:",
          error
        );

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to delete conversation."
        );
      }
    };

  /*
   * Send message
   */
  const handleSendMessage = async (
    content
  ) => {

    if (!content.trim()) {
      return;
    }

    if (!selectedConversation) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
    };

    /*
     * Optimistic UI
     */
    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    setIsTyping(true);
    setError("");

    try {

      const response =
        await sendMessage({
          conversationId:
            selectedConversation.id,
          message: content,
        });

      console.log(
        "POST /api/chat:",
        response
      );

      const data =
        response?.data ??
        response;

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content:
          data?.message ||
          data?.response ||
          data?.content ||
          "I received your message.",
      };

      setMessages((prev) => [
        ...prev,
        assistantMessage,
      ]);

    } catch (error) {

      console.error(
        "Failed to send message:",
        error
      );

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "MindCare is currently unavailable."
      );

    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AppLayout activePath="/chat">

      <div className="flex h-[calc(100vh-80px)] overflow-hidden">

        <ConversationSidebar
          conversations={
            conversations
          }
          selectedConversation={
            selectedConversation
          }
          loading={
            loadingConversations
          }
          onSelect={
            handleSelectConversation
          }
          onNewConversation={
            handleNewConversation
          }
          onDelete={
            handleDeleteConversation
          }
        />

        <div className="flex min-w-0 flex-1 flex-col">

          {error && (
            <div className="border-b border-red-100 bg-red-50 px-4 py-2.5 text-center text-xs text-red-600">
              {error}
            </div>
          )}

          <ChatWindow
            conversation={
              selectedConversation
            }
            messages={messages}
            loadingMessages={
              loadingMessages
            }
            isTyping={isTyping}
            onSend={
              handleSendMessage
            }
          />

        </div>

      </div>

    </AppLayout>
  );
}