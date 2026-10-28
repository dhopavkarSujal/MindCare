import prisma from "../db/prisma.js";

function notFound(message) {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
}

function conflict(message) {
  const error = new Error(message);
  error.statusCode = 409;
  return error;
}

// Convert midnight for a calendar date in an IANA timezone into a UTC instant.
function zonedMidnightToUtc(dateString, timeZone) {
  const [year, month, day] = dateString.split("-").map(Number);
  const wallTimeAsUtc = Date.UTC(year, month - 1, day, 0, 0, 0);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  });

  let candidate = wallTimeAsUtc;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = Object.fromEntries(
      formatter.formatToParts(new Date(candidate))
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, Number(part.value)])
    );
    const representedAsUtc = Date.UTC(
      parts.year, parts.month - 1, parts.day,
      parts.hour, parts.minute, parts.second
    );
    const nextCandidate = wallTimeAsUtc - (representedAsUtc - candidate);
    if (nextCandidate === candidate) break;
    candidate = nextCandidate;
  }
  return new Date(candidate);
}

function nextCalendarDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
}

export async function getActiveCounsellors() {
  return prisma.counsellor.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, specialty: true, bio: true, avatarUrl: true },
  });
}

export async function getCounsellorSlots(counsellorId, date) {
  const counsellor = await prisma.counsellor.findFirst({
    where: { id: counsellorId, isActive: true },
    select: { id: true, timeZone: true },
  });
  if (!counsellor) throw notFound("Counsellor not found.");

  const start = zonedMidnightToUtc(date, counsellor.timeZone);
  const end = zonedMidnightToUtc(nextCalendarDate(date), counsellor.timeZone);
  const now = new Date();
  const slots = await prisma.availabilitySlot.findMany({
    where: {
      counsellorId, isActive: true,
      startsAt: { gte: start, lt: end },
      endsAt: { gt: now },
    },
    orderBy: { startsAt: "asc" },
    select: { id: true, startsAt: true, endsAt: true, isAvailable: true },
  });

  return slots.map((slot) => ({
    id: slot.id,
    startTime: slot.startsAt.toISOString(),
    endTime: slot.endsAt.toISOString(),
    isAvailable: slot.isAvailable && slot.startsAt > now,
  }));
}

export async function createCounsellor(input) {
  return prisma.counsellor.create({
    data: {
      name: input.name,
      specialty: input.specialty ?? null,
      bio: input.bio ?? null,
      avatarUrl: input.avatarUrl ?? null,
      timeZone: input.timeZone ?? "Asia/Kolkata",
      // Providers remain hidden until an admin explicitly publishes the listing.
      isActive: input.isActive ?? false,
    },
    select: {
      id: true, name: true, specialty: true, bio: true,
      avatarUrl: true, timeZone: true, isActive: true,
    },
  });
}

export async function createAvailabilitySlot(counsellorId, startsAt, endsAt) {
  const counsellor = await prisma.counsellor.findUnique({
    where: { id: counsellorId }, select: { id: true },
  });
  if (!counsellor) throw notFound("Counsellor not found.");

  const overlap = await prisma.availabilitySlot.findFirst({
    where: {
      counsellorId, isActive: true,
      startsAt: { lt: endsAt }, endsAt: { gt: startsAt },
    },
    select: { id: true },
  });
  if (overlap) throw conflict("This slot overlaps an existing active availability slot.");

  try {
    return await prisma.availabilitySlot.create({
      data: { counsellorId, startsAt, endsAt, isActive: true, isAvailable: true },
      select: { id: true, counsellorId: true, startsAt: true, endsAt: true, isAvailable: true },
    });
  } catch (error) {
    if (error?.code === "P2002") throw conflict("An availability slot already exists at this time.");
    throw error;
  }
}

export async function getAdminCounsellors() {
  return prisma.counsellor.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    include: {
      user: { select: { id: true, name: true, email: true } },
      _count: {
        select: { availabilitySlots: true, appointments: true },
      },
    },
    take: 100,
  });
}


export async function getAdminCounsellorUsers() {
  return prisma.user.findMany({
    where: { role: "COUNSELOR", supabaseAuthId: { not: null } },
    select: {
      id: true,
      name: true,
      email: true,
      counsellorProfile: { select: { id: true, name: true } },
    },
    orderBy: [{ name: "asc" }, { email: "asc" }],
  });
}

export async function linkCounsellorUser(counsellorId, userId) {
  const profile = await prisma.counsellor.findUnique({
    where: { id: counsellorId },
    select: { id: true, userId: true },
  });
  if (!profile) throw notFound("Counsellor profile not found.");

  if (userId === null) {
    if (profile.userId) {
      const activeAppointment = await prisma.appointment.findFirst({
        where: {
          counsellorId,
          status: { in: ["PENDING", "CONFIRMED"] },
          endsAt: { gt: new Date() },
        },
        select: { id: true },
      });
      if (activeAppointment) {
        throw conflict("This counsellor has pending or confirmed appointments. Resolve them before unlinking the account.");
      }
    }
    return prisma.counsellor.update({
      where: { id: counsellorId },
      data: { userId: null },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      supabaseAuthId: true,
      counsellorProfile: { select: { id: true } },
    },
  });
  if (!user) throw notFound("Application user not found.");
  if (user.role !== "COUNSELOR") {
    throw conflict("Only application users with the COUNSELOR role can be linked to a counsellor profile.");
  }
  if (!user.supabaseAuthId) {
    throw conflict("This counsellor user is not linked to Supabase Auth yet.");
  }
  if (user.counsellorProfile && user.counsellorProfile.id !== counsellorId) {
    throw conflict("This account is already linked to another counsellor profile.");
  }
  if (profile.userId && profile.userId !== userId) {
    const activeAppointment = await prisma.appointment.findFirst({
      where: {
        counsellorId,
        status: { in: ["PENDING", "CONFIRMED"] },
        endsAt: { gt: new Date() },
      },
      select: { id: true },
    });
    if (activeAppointment) {
      throw conflict("This profile has pending or confirmed appointments. Resolve them before changing the linked account.");
    }
  }

  return prisma.counsellor.update({
    where: { id: counsellorId },
    data: { userId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
}

export async function updateCounsellor(counsellorId, input) {
  const existing = await prisma.counsellor.findUnique({
    where: { id: counsellorId },
    select: { id: true },
  });
  if (!existing) throw notFound("Counsellor profile not found.");
  return prisma.counsellor.update({
    where: { id: counsellorId },
    data: { isActive: input.isActive },
    select: {
      id: true, name: true, specialty: true, bio: true,
      avatarUrl: true, timeZone: true, isActive: true, userId: true,
    },
  });
}
