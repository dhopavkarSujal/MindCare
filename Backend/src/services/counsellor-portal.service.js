import prisma from "../db/prisma.js";
import { createAvailabilitySlot } from "./counsellor.service.js";

function missingProfile() {
  const error = new Error("Your counselor login is not linked to a counselor profile. Ask an administrator to connect your account.");
  error.statusCode = 409;
  return error;
}

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

async function requireLinkedCounsellor(userId, tx = prisma) {
  const profile = await tx.counsellor.findUnique({
    where: { userId },
    select: { id: true, name: true, specialty: true, bio: true, timeZone: true, isActive: true },
  });
  if (!profile) throw missingProfile();
  return profile;
}

export async function getCounsellorWorkspace(userId) {
  return requireLinkedCounsellor(userId);
}

export async function getCounsellorAppointments(userId, status = "") {
  const profile = await requireLinkedCounsellor(userId);
  const where = {
    counsellorId: profile.id,
    ...(status ? { status: status.toUpperCase() } : {}),
  };
  const appointments = await prisma.appointment.findMany({
    where,
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: [{ startsAt: "asc" }, { createdAt: "desc" }],
    take: 200,
  });
  return appointments.map((appointment) => ({
    appointmentId: appointment.id,
    studentId: appointment.user.id,
    studentName: appointment.user.name,
    studentEmail: appointment.user.email,
    startsAt: appointment.startsAt.toISOString(),
    endsAt: appointment.endsAt.toISOString(),
    status: appointment.status.toLowerCase(),
    reason: appointment.reason,
    createdAt: appointment.createdAt.toISOString(),
  }));
}

export async function getCounsellorAvailability(userId) {
  const profile = await requireLinkedCounsellor(userId);
  const now = new Date();
  const slots = await prisma.availabilitySlot.findMany({
    where: {
      counsellorId: profile.id,
      isActive: true,
      startsAt: { gt: now },
      endsAt: { gt: now },
    },
    include: {
      appointments: {
        where: { status: { in: ["PENDING", "CONFIRMED"] } },
        select: { status: true },
        take: 1,
      },
    },
    orderBy: { startsAt: "asc" },
    take: 120,
  });
  return slots.map((slot) => ({
    id: slot.id,
    startTime: slot.startsAt.toISOString(),
    endTime: slot.endsAt.toISOString(),
    isAvailable: slot.isAvailable,
    bookingStatus: slot.appointments[0]?.status.toLowerCase() ?? null,
  }));
}

export async function createCounsellorAvailability(userId, startsAt, endsAt) {
  const profile = await requireLinkedCounsellor(userId);
  if (!profile.isActive) throw conflict("Your counselor profile is inactive. Ask an administrator to reactivate it before adding availability.");
  return createAvailabilitySlot(profile.id, startsAt, endsAt);
}

export async function deactivateCounsellorAvailability(userId, slotId) {
  const profile = await requireLinkedCounsellor(userId);
  const slot = await prisma.availabilitySlot.findFirst({
    where: { id: slotId, counsellorId: profile.id, isActive: true },
    select: { id: true, startsAt: true },
  });
  if (!slot) throw notFound("Availability slot not found.");
  if (slot.startsAt <= new Date()) throw conflict("Past availability cannot be changed.");

  const activeAppointment = await prisma.appointment.findFirst({
    where: {
      slotId,
      status: { in: ["PENDING", "CONFIRMED"] },
      endsAt: { gt: new Date() },
    },
    select: { id: true },
  });
  if (activeAppointment) {
    throw conflict("This slot has a pending or confirmed appointment. Cancel or resolve the appointment before removing availability.");
  }

  await prisma.availabilitySlot.update({
    where: { id: slotId },
    data: { isActive: false, isAvailable: false },
  });
  return { deactivated: true };
}

export async function completeCounsellorAppointment(userId, appointmentId) {
  const profile = await requireLinkedCounsellor(userId);
  return prisma.$transaction(async (tx) => {
    const appointment = await tx.appointment.findFirst({
      where: { id: appointmentId, counsellorId: profile.id },
      select: { id: true, status: true, startsAt: true, endsAt: true },
    });
    if (!appointment) throw notFound("Appointment not found in your assigned schedule.");
    if (appointment.status === "COMPLETED") return { status: "completed" };
    if (appointment.status !== "CONFIRMED") {
      throw conflict("Only confirmed appointments can be marked completed.");
    }
    if (appointment.endsAt > new Date()) {
      throw conflict("An appointment can be marked completed only after its scheduled end time.");
    }
    await tx.appointment.update({
      where: { id: appointmentId },
      data: { status: "COMPLETED" },
    });
    return { status: "completed" };
  });
}
