import api from "../lib/api";
import { getCurrentUserId } from "./auth.service";

export const getConversations = async () => {
  const response = await api.get("/conversations");

  return response.data;
};

export const getConversation = async (
  conversationId
) => {
  const response = await api.get(
    `/conversations/${conversationId}`
  );

  return response.data;
};

export const createConversation = async ({
  title,
}) => {
  const userId = await getCurrentUserId();

  const payload = {
    title,
    userId,
  };

  console.log(
    "Creating conversation with:",
    payload
  );

  const response = await api.post(
    "/conversations",
    payload
  );

  return response.data;
};

export const deleteConversation = async (
  conversationId
) => {
  const response = await api.delete(
    `/conversations/${conversationId}`
  );

  return response.data;
};