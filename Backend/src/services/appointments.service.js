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

function toAppointmentDto(appointment) {
  return {
    appointmentId: appointment.id,
    counsellorId: appointment.counsellorId,
    counsellorName: appointment.counsellor.name,
    startsAt: appointment.startsAt.toISOString(),
    endsAt: appointment.endsAt.toISOString(),
    status: appointment.status.toLowerCase(),
    reason: appointment.reason,
    createdAt: appointment.createdAt.toISOString(),
  };
}

function withStudentDto(appointment) {
  return {
    ...toAppointmentDto(appointment),
    userId: appointment.userId,
    userName: appointment.user.name,
    userEmail: appointment.user.email,
  };
}

export async function getAdminAppointments(status = "") {
  const where = status ? { status: status.toUpperCase() } : {};
  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      counsellor: { select: { name: true } },
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: [{ startsAt: "asc" }, { createdAt: "desc" }],
    take: 200,
  });
  return appointments.map(withStudentDto);
}

export async function getUserAppointments(userId) {
  const appointments = await prisma.appointment.findMany({
    where: { userId },
    include: { counsellor: { select: { name: true } } },
    orderBy: [{ startsAt: "asc" }, { createdAt: "desc" }],
  });
  return appointments.map(toAppointmentDto);
}

export async function bookAppointment(userId, { counsellorId, startTime, reason }) {
  const startsAt = new Date(startTime);
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const slot = await tx.availabilitySlot.findFirst({
      where: {
        counsellorId,
        startsAt,
        isActive: true,
        endsAt: { gt: now },
        counsellor: { isActive: true },
      },
      select: { id: true, startsAt: true, endsAt: true, isAvailable: true },
    });
    if (!slot) throw notFound("Availability slot not found for this counsellor.");
    if (!slot.isAvailable || slot.startsAt <= now || slot.endsAt <= now) {
      throw conflict("This time slot is no longer available. Refresh availability and choose another time.");
    }

    // Prevent the same student from having overlapping active appointments.
    const overlappingBooking = await tx.appointment.findFirst({
      where: {
        userId,
        status: { in: ["PENDING", "CONFIRMED"] },
        startsAt: { lt: slot.endsAt },
        endsAt: { gt: slot.startsAt },
      },
      select: { id: true },
    });
    if (overlappingBooking) {
      throw conflict("You already have a pending or confirmed appointment during this time.");
    }

    // A conditional update serializes competing requests for the same slot.
    const claim = await tx.availabilitySlot.updateMany({
      where: { id: slot.id, isAvailable: true, isActive: true, startsAt: { gt: now } },
      data: { isAvailable: false },
    });
    if (claim.count !== 1) {
      throw conflict("This time slot was just booked. Refresh availability and choose another time.");
    }

    const appointment = await tx.appointment.create({
      data: {
        userId,
        counsellorId,
        slotId: slot.id,
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
        reason: reason?.trim() || null,
        status: "PENDING",
      },
      include: { counsellor: { select: { name: true } } },
    });
    return toAppointmentDto(appointment);
  });
}

export async function cancelUserAppointment(userId, appointmentId) {
  return prisma.$transaction(async (tx) => {
    const appointment = await tx.appointment.findFirst({
      where: { id: appointmentId, userId },
      select: { id: true, status: true, startsAt: true, slotId: true },
    });
    if (!appointment) throw notFound("Appointment not found.");
    if (appointment.status === "CANCELLED") return { cancelled: true };
    if (["REJECTED", "COMPLETED"].includes(appointment.status)) {
      throw conflict("This appointment can no longer be cancelled.");
    }
    if (appointment.startsAt <= new Date()) {
      throw conflict("Appointments cannot be cancelled after the scheduled start time.");
    }

    await tx.appointment.update({
      where: { id: appointment.id },
      data: { status: "CANCELLED" },
    });
    // Re-open only an active, future slot; historical appointment data is retained.
    await tx.availabilitySlot.updateMany({
      where: { id: appointment.slotId, startsAt: { gt: new Date() }, isActive: true },
      data: { isAvailable: true },
    });
    return { cancelled: true };
  });
}

export async function updateAppointmentStatus(appointmentId, status) {
  return prisma.$transaction(async (tx) => {
    const appointment = await tx.appointment.findUnique({
      where: { id: appointmentId },
      select: { id: true, status: true, startsAt: true, slotId: true },
    });
    if (!appointment) throw notFound("Appointment not found.");
    if (appointment.status === status) return { status: status.toLowerCase() };

    if (["CANCELLED", "REJECTED", "COMPLETED"].includes(appointment.status)) {
      throw conflict("This appointment is closed and cannot be reopened. A new booking is required.");
    }
    if (status === "CONFIRMED" && appointment.status !== "PENDING") {
      throw conflict("Only pending appointments can be confirmed.");
    }
    if (status === "REJECTED" && appointment.status !== "PENDING") {
      throw conflict("Only pending appointments can be rejected.");
    }
    if (status === "CANCELLED" && appointment.startsAt <= new Date()) {
      throw conflict("Appointments cannot be cancelled after the scheduled start time.");
    }

    await tx.appointment.update({
      where: { id: appointmentId },
      data: { status },
    });
    if (["CANCELLED", "REJECTED"].includes(status) && appointment.startsAt > new Date()) {
      await tx.availabilitySlot.updateMany({
        where: { id: appointment.slotId, isActive: true, startsAt: { gt: new Date() } },
        data: { isAvailable: true },
      });
    }
    return { status: status.toLowerCase() };
  });
}
