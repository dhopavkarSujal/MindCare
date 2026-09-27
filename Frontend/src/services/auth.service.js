import { supabase } from "../lib/supabase";

export const getCurrentSession = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  if (!session) {
    throw new Error("No active session found.");
  }

  return session;
};

export const getCurrentUser = async () => {
  const session = await getCurrentSession();

  if (!session.user) {
    throw new Error("No authenticated user found.");
  }

  return session.user;
};

export const getCurrentUserId = async () => {
  const user = await getCurrentUser();

  if (!user.id) {
    throw new Error("Authenticated user ID is missing.");
  }

  return user.id;
};