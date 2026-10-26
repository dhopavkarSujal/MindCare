import prisma from "../db/prisma.js";

// Start with privacy-preserving defaults. Mood-context consent is currently stored
// for future integration; chat does not yet attach mood history to AI requests.
export const SUPPORTED_CONSENTS = [
  { permission: "share_mood_data", enabled: false },
  { permission: "notifications", enabled: false },
];

export async function getUserConsents(userId) {
  const stored = await prisma.consentPreference.findMany({
    where: {
      userId,
      permission: { in: SUPPORTED_CONSENTS.map((item) => item.permission) },
    },
    select: { permission: true, enabled: true },
  });

  const storedByPermission = new Map(stored.map((item) => [item.permission, item.enabled]));
  return SUPPORTED_CONSENTS.map(({ permission, enabled }) => ({
    permission,
    enabled: storedByPermission.get(permission) ?? enabled,
  }));
}

export async function setUserConsent(userId, permission, enabled) {
  const allowed = SUPPORTED_CONSENTS.some((item) => item.permission === permission);
  if (!allowed) {
    const error = new Error("Unsupported consent permission.");
    error.statusCode = 400;
    throw error;
  }

  const consent = await prisma.consentPreference.upsert({
    where: {
      userId_permission: { userId, permission },
    },
    create: { userId, permission, enabled },
    update: { enabled },
    select: { permission: true, enabled: true, updatedAt: true },
  });

  return consent;
}
