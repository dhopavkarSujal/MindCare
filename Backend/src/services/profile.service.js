import prisma from "../db/prisma.js";

const PROFILE_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  preferences: true,
  createdAt: true,
  updatedAt: true,
};

// Profile operations always target the verified user ID from auth middleware.
export async function getUserProfile(userId) {
  const profile = await prisma.user.findUnique({
    where: { id: userId },
    select: PROFILE_SELECT,
  });

  if (!profile) {
    const error = new Error("Profile not found.");
    error.statusCode = 404;
    throw error;
  }

  return profile;
}

export async function updateUserProfile(userId, { name, preferences }) {
  const data = {};
  if (name !== undefined) data.name = name;
  if (preferences !== undefined) data.preferences = preferences;

  try {
    return await prisma.user.update({
      where: { id: userId },
      data,
      select: PROFILE_SELECT,
    });
  } catch (error) {
    if (error?.code === "P2025") {
      const notFound = new Error("Profile not found.");
      notFound.statusCode = 404;
      throw notFound;
    }
    throw error;
  }
}
