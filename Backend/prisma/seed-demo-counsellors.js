import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const TIME_ZONE = "Asia/Kolkata";
const UTC_OFFSET = "+05:30";
const SLOT_DURATION_MINUTES = 45;
const DAYS_AHEAD = 14;
const DAILY_START_TIMES = ["10:00", "15:00"];

// These are deliberately fictional and visibly marked as demo records.
const DEMO_COUNSELLORS = [
  {
    id: "d3a00001-6e27-4db2-bf5f-000000000001",
    name: "MindCare Demo Counsellor 01",
    specialty: "Academic stress & study habits · DEMO",
    bio: "Fictional showcase profile for testing the MindCare V2 booking flow. This is not a real counsellor, and appointments made against this profile are not real mental-health appointments.",
  },
  {
    id: "d3a00002-6e27-4db2-bf5f-000000000002",
    name: "MindCare Demo Counsellor 02",
    specialty: "Anxiety coping skills · DEMO",
    bio: "Fictional showcase profile for testing the MindCare V2 booking flow. This is not a real counsellor, and appointments made against this profile are not real mental-health appointments.",
  },
  {
    id: "d3a00003-6e27-4db2-bf5f-000000000003",
    name: "MindCare Demo Counsellor 03",
    specialty: "Student wellbeing · DEMO",
    bio: "Fictional showcase profile for testing the MindCare V2 booking flow. This is not a real counsellor, and appointments made against this profile are not real mental-health appointments.",
  },
];

if (process.env.NODE_ENV === "production") {
  console.error("Refusing to seed demo counsellors when NODE_ENV=production.");
  process.exit(1);
}

if (process.env.ALLOW_DEMO_COUNSELLOR_SEED !== "true") {
  console.error(
    "Demo seed blocked. Verify Backend/.env points to the intended DEVELOPMENT database, then set ALLOW_DEMO_COUNSELLOR_SEED=true for this command."
  );
  process.exit(1);
}

const prisma = new PrismaClient();

function dateInTimeZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function addCalendarDays(dateString, days) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days))
    .toISOString()
    .slice(0, 10);
}

function isSunday(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay() === 0;
}

function slotTimesForShowcase() {
  const today = dateInTimeZone(new Date(), TIME_ZONE);
  const slots = [];

  // Create a rolling two-week demo calendar starting tomorrow; skip Sundays.
  for (let dayOffset = 1; dayOffset <= DAYS_AHEAD; dayOffset += 1) {
    const date = addCalendarDays(today, dayOffset);
    if (isSunday(date)) continue;

    for (const time of DAILY_START_TIMES) {
      const startsAt = new Date(`${date}T${time}:00${UTC_OFFSET}`);
      if (startsAt <= new Date()) continue;

      slots.push({
        startsAt,
        endsAt: new Date(startsAt.getTime() + SLOT_DURATION_MINUTES * 60_000),
      });
    }
  }

  return slots;
}

async function main() {
  const slots = slotTimesForShowcase();

  if (slots.length === 0) {
    throw new Error("No future showcase slots were generated.");
  }

  for (const counsellor of DEMO_COUNSELLORS) {
    await prisma.counsellor.upsert({
      where: { id: counsellor.id },
      create: {
        ...counsellor,
        timeZone: TIME_ZONE,
        isActive: true,
      },
      update: {
        ...counsellor,
        timeZone: TIME_ZONE,
        isActive: true,
      },
    });

    for (const slot of slots) {
      await prisma.availabilitySlot.upsert({
        where: {
          counsellorId_startsAt: {
            counsellorId: counsellor.id,
            startsAt: slot.startsAt,
          },
        },
        create: {
          counsellorId: counsellor.id,
          startsAt: slot.startsAt,
          endsAt: slot.endsAt,
          isAvailable: true,
          isActive: true,
        },
        // Do not reset isAvailable: rerunning this seed must not reopen a
        // slot that a user has already booked.
        update: {
          endsAt: slot.endsAt,
          isActive: true,
        },
      });
    }
  }

  console.info(
    `Ensured ${DEMO_COUNSELLORS.length} fictional demo counsellors and ${slots.length * DEMO_COUNSELLORS.length} upcoming slot records. Existing booking availability states were preserved.`
  );
}

main()
  .catch((error) => {
    console.error("Failed to seed demo counsellors:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
