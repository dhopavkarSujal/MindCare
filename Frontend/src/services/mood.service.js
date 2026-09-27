import api from "../lib/api";

/**
 * Get moods for currently authenticated user
 */
export const getMoods = async () => {
  const response = await api.get("/moods");

  return response.data;
};

/**
 * Get one mood
 */
export const getMood = async (moodId) => {
  const response = await api.get(
    `/moods/${moodId}`
  );

  return response.data;
};

/**
 * Create mood
 */
export const createMood = async ({
  score,
  note,
}) => {
  const response = await api.post(
    "/moods",
    {
      score,
      note,
    }
  );

  return response.data;
};

/**
 * Update mood
 */
export const updateMood = async (
  moodId,
  data
) => {
  const response = await api.patch(
    `/moods/${moodId}`,
    data
  );

  return response.data;
};

/**
 * Delete mood
 */
export const deleteMood = async (
  moodId
) => {
  const response = await api.delete(
    `/moods/${moodId}`
  );

  return response.data;
};