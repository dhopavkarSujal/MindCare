import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getConversations,
  getConversation,
  createConversation,
  deleteConversation,
  renameConversation,
  toggleConversationPin,
} from "../services/conversation.service";

import AppLayout from "../components/layout/AppLayout";

import ConversationSidebar from "../components/chat/ConversationSidebar";
import ChatWindow from "../components/chat/ChatWindow";

import {
  sendMessage,
} from "../services/chat.service";
const initialMessage = {
  id: "welcome-message",
  role: "assistant",
  content:
    "Hi, I'm MindCare. I'm here to listen. What would you like to talk about?",
};

  const normalizeMessages = (
    messages = []
  ) => {
    return messages
      .filter((message) => {
        /*
        * SYSTEM messages are database/internal messages.
        * They should not be displayed as normal chat bubbles.
        */
        return message?.sender !== "SYSTEM";
      })
      .map((message, index) => {
        let role;

        switch (message?.sender) {
          case "USER":
            role = "user";
            break;

          case "ASSISTANT":
            role = "assistant";
            break;

          default:
            throw new Error(
              `Invalid message sender at index ${index}: ${message?.sender}`
            );
        }

        const content =
          message?.text ??
          message?.content ??
          message?.message ??
          "";

        if (!content.trim()) {
          throw new Error(
            `Message at index ${index} has no content.`
          );
        }

        return {
          id:
            message?.id ??
            `${role}-${index}`,

          role,

          content,

          createdAt:
            message?.createdAt ??
            message?.created_at ??
            null,
        };
      });
  };

  const handleRenameConversation =
  async (
    conversationId,
    newTitle
  ) => {
    const trimmedTitle =
      newTitle.trim();

    if (!trimmedTitle) {
      return false;
    }

    try {
      setError("");

      const response =
        await renameConversation(
          conversationId,
          trimmedTitle
        );

      const updatedConversation =
        response?.data ??
        response;

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id ===
          conversationId
            ? {
                ...conversation,
                ...updatedConversation,
                title: trimmedTitle,
              }
            : conversation
        )
      );

      setSelectedConversation(
        (current) =>
          current?.id === conversationId
            ? {
                ...current,
                ...updatedConversation,
                title: trimmedTitle,
              }
            : current
      );

      return true;
    } catch (error) {
      console.error(
        "Failed to rename conversation:",
        error
      );

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to rename conversation."
      );

      return false;
    }
  };

  const handleTogglePin =
  async (
    conversationId,
    isPinned
  ) => {
    try {
      setError("");

      await toggleConversationPin(
        conversationId,
        isPinned
      );

      await loadConversations();

      return true;
    } catch (error) {
      console.error(
        "Failed to update conversation pin:",
        error
      );

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to update conversation pin."
      );

      return false;
    }
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

  const [creatingConversation, setCreatingConversation] =
    useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * Used to prevent an older conversation request
   * from overwriting a newer conversation selection.
   */
  const conversationRequestRef =
    useRef(0);

  /*
   * Load conversation list
   */
  const loadConversations = async () => {
    try {
      setLoadingConversations(true);

      const response =
        await getConversations();

      console.log(
        "GET /api/conversations:",
        response
      );

      const data =
        response?.data ??
        response;

      const updatedConversations =
        Array.isArray(data)
          ? data
          : [];

      setConversations(
        updatedConversations
      );

      /*
       * Keep the currently selected conversation
       * synchronized with refreshed sidebar metadata.
       */
      setSelectedConversation((current) => {
        if (!current) {
          return current;
        }

        const updatedConversation =
          updatedConversations.find(
            (conversation) =>
              conversation.id === current.id
          );

        return (
          updatedConversation ??
          current
        );
      });

      return updatedConversations;
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

      return [];
    } finally {
      setLoadingConversations(false);
    }
  };

  /*
   * Initial conversation list
   */
  useEffect(() => {
    loadConversations();
  }, []);

  const handleRenameConversation = async (
    conversationId,
    newTitle
  ) => {
    const trimmedTitle = newTitle.trim();

    if (!trimmedTitle) {
      return false;
    }

    try {
      setError("");

      const response =
        await renameConversation(
          conversationId,
          trimmedTitle
        );

      const updatedConversation =
        response?.data ??
        response;

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                ...updatedConversation,
                title: trimmedTitle,
              }
            : conversation
        )
      );

      setSelectedConversation((current) =>
        current?.id === conversationId
          ? {
              ...current,
              ...updatedConversation,
              title: trimmedTitle,
            }
          : current
      );

      return true;
    } catch (error) {
      console.error(
        "Failed to rename conversation:",
        error
      );

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to rename conversation."
      );

      return false;
    }
  };

  const handleTogglePin = async (
    conversationId,
    isPinned
  ) => {
    try {
      setError("");

      await toggleConversationPin(
        conversationId,
        isPinned
      );

      await loadConversations();

      return true;
    } catch (error) {
      console.error(
        "Failed to update conversation pin:",
        error
      );

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to update conversation pin."
      );

      return false;
    }
  };

  /*
   * Open conversation
   */
  const handleSelectConversation =
    async (conversation) => {
      /*
       * Every new selection gets a new request ID.
       * Older requests become stale.
       */
      const requestId =
        ++conversationRequestRef.current;

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

        /*
         * Ignore an older response if the user
         * already selected another conversation.
         */
        if (
          requestId !==
          conversationRequestRef.current
        ) {
          return;
        }

        const data =
          response?.data ??
          response;

        const loadedMessages =
          normalizeMessages(
            data?.messages ?? []
          );

        setMessages(
          loadedMessages.length
            ? loadedMessages
            : [initialMessage]
        );
      } catch (error) {
        /*
         * Ignore errors belonging to stale requests.
         */
        if (
          requestId !==
          conversationRequestRef.current
        ) {
          return;
        }

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
        /*
         * Only the latest request can change
         * the loading state.
         */
        if (
          requestId ===
          conversationRequestRef.current
        ) {
          setLoadingMessages(false);
        }
      }
    };

  /*
   * Create new conversation
   */
  const handleNewConversation =
    async () => {
      /*
       * Prevent duplicate POST requests.
       */
      if (creatingConversation) {
        return null;
      }

      try {
        setCreatingConversation(true);
        setError("");

        /*
         * A new conversation selection invalidates
         * any previous conversation-loading request.
         */
        ++conversationRequestRef.current;

        const response =
          await createConversation({
            title: "New Support Session",
          });

        console.log(
          "POST /api/conversations:",
          response
        );

        const newConversation =
          response?.data ??
          response;

        if (!newConversation?.id) {
          throw new Error(
            "Server did not return a valid conversation."
          );
        }

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

        setLoadingMessages(false);

        return newConversation;
      } catch (error) {
        console.error(
          "Failed to create conversation:",
          error
        );

        console.error(
          "Status:",
          error?.response?.status
        );

        console.error(
          "Backend response:",
          error?.response?.data
        );

        setError(
          error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            "Unable to create conversation."
        );

        return null;
      } finally {
        setCreatingConversation(false);
      }
    };

  /*
   * Delete conversation
   */
  const handleDeleteConversation =
    async (conversationId) => {
      const confirmed =
        window.confirm(
          "Delete this conversation? This action cannot be undone."
        );

      if (!confirmed) {
        return false;
      }

      /*
       * Invalidate any conversation-loading request
       * that may still be running for the deleted chat.
       */
      ++conversationRequestRef.current;

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

        setLoadingMessages(false);

        return true;
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

        return false;
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

    /*
     * Capture the conversation ID because the user
     * could switch conversations while the AI request
     * is still running.
     */
    const conversationId =
      selectedConversation.id;

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
          conversationId,
          message: content,
        });

      console.log(
        "POST /api/chat:",
        response
      );

      const data =
        response?.data ??
        response;

      /*
       * Strict AI response validation.
       */
      const aiMessage =
        data?.aiMessage;

      if (!aiMessage) {
        throw new Error(
          "AI response is missing from the server response."
        );
      }

      const assistantMessage = {
        id:
          aiMessage.id ??
          `assistant-${Date.now()}`,

        role: "assistant",

        content:
          aiMessage.content ??
          aiMessage.text ??
          aiMessage.message,

        createdAt:
          aiMessage.createdAt ??
          aiMessage.created_at ??
          null,
      };

      if (
        !assistantMessage.content
      ) {
        throw new Error(
          "AI response did not contain message content."
        );
      }

      /*
       * Only append the AI response if the user
       * is still viewing the same conversation.
       */
      if (
        selectedConversation?.id ===
        conversationId
      ) {
        setMessages((prev) => [
          ...prev,
          assistantMessage,
        ]);
      }

      /*
       * Refresh sidebar metadata after the
       * backend has processed the message.
       */
      await loadConversations();
    } catch (error) {
      console.error(
        "Failed to send message:",
        error
      );

      /*
       * Don't show an error on another conversation
       * if the user switched while the request ran.
       */
      if (
        selectedConversation?.id ===
        conversationId
      ) {
        setError(
          error?.response?.data?.message ||
            error?.message ||
            "MindCare is currently unavailable."
        );
      }
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AppLayout activePath="/chat">
      <div className="flex h-full min-h-0 overflow-hidden">
        
        <ConversationSidebar
          conversations={conversations}
          selectedConversation={selectedConversation}
          loading={loadingConversations}
          onSelect={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDelete={handleDeleteConversation}
          onRename={handleRenameConversation}
          onTogglePin={handleTogglePin}
          mobileOpen={mobileSidebarOpen}
          onClose={() =>
            setMobileSidebarOpen(false)
          }
          creatingConversation={
            creatingConversation
          }
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">

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
            onOpenSidebar={() =>
              setMobileSidebarOpen(
                true
              )
            }
          />

        </div>
      </div>
    </AppLayout>
  );
}