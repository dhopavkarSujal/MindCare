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


export async function getAdminAppointments(status = "") {
  const where = status ? { status: status.toUpperCase() } : {};
  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      counsellor: { select: { name: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: [{ startsAt: "asc" }, { createdAt: "desc" }],
    take: 100,
  });

  return appointments.map((appointment) => ({
    ...toAppointmentDto(appointment),
    userName: appointment.user.name,
    userEmail: appointment.user.email,
  }));
}

export async function getUserAppointments(userId) {
  const appointments = await prisma.appointment.findMany({
    where: { userId },
    include: { counsellor: { select: { name: true } } },
    orderBy: { startsAt: "asc" },
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
        counsellor: { isActive: true },
      },
      select: { id: true, startsAt: true, endsAt: true, isAvailable: true },
    });
    if (!slot) throw notFound("Availability slot not found for this counsellor.");
    if (!slot.isAvailable || slot.startsAt <= now || slot.endsAt <= now) {
      throw conflict("This time slot is no longer available. Refresh availability and choose another time.");
    }

    // Conditional claim is atomic: concurrent requests cannot book the same slot.
    const claim = await tx.availabilitySlot.updateMany({
      where: { id: slot.id, isAvailable: true, isActive: true, startsAt: { gt: now } },
      data: { isAvailable: false },
    });
    if (claim.count !== 1) {
      throw conflict("This time slot was just booked. Refresh availability and choose another time.");
    }

    const appointment = await tx.appointment.create({
      data: {
        userId, counsellorId, slotId: slot.id,
        startsAt: slot.startsAt, endsAt: slot.endsAt,
        reason: reason?.trim() || null, status: "PENDING",
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
    if (appointment.startsAt <= new Date()) {
      throw conflict("Past appointments cannot be cancelled.");
    }

    await tx.appointment.update({
      where: { id: appointment.id }, data: { status: "CANCELLED" },
    });
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
    if (appointment.status === "CANCELLED") {
      throw conflict("A cancelled appointment cannot be reopened; the user must book an available slot.");
    }
    if (status === "CONFIRMED" && appointment.status !== "PENDING") {
      throw conflict("Only pending appointments can be confirmed.");
    }

    await tx.appointment.update({ where: { id: appointmentId }, data: { status } });
    if (status === "CANCELLED" && appointment.startsAt > new Date()) {
      await tx.availabilitySlot.updateMany({
        where: { id: appointment.slotId, isActive: true, startsAt: { gt: new Date() } },
        data: { isAvailable: true },
      });
    }
    return { status: status.toLowerCase() };
  });
}
