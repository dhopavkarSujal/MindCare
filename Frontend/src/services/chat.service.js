import api from "../lib/api";

export const sendMessage =
  async (data) => {
    const response =
      await api.post(
        "/chat",
        data
      );

    return response.data;
  };