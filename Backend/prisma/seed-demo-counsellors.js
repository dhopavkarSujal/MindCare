import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const TIME_ZONE = "Asia/Kolkata";
const UTC_OFFSET = "+05:30";
const SLOT_DURATION_MINUTES = 45;
const WORKING_DAYS_AHEAD = 9;
const DAILY_START_TIMES = ["10:00", "15:00"];

// These are deliberately fictional and visibly marked as demo records.
const DEMO_COUNSELLORS = [
  {
    id: "670944f9-4c59-4573-a62f-b37879fe51e2",
    name: "Dr. Aanya Sharma",
    specialty: "Academic Stress & Exam Anxiety",
    bio: "Demo profile: Provides supportive guidance for students managing exam pressure, academic expectations, study-related stress, and performance anxiety. Encourages practical coping strategies, balanced routines, and realistic academic goals.",
  },
  {
    id: "07a6f4e5-61b5-40bc-9d2b-056fc7a91349",
    name: "Dr. Arjun Patel",
    specialty: "Self-confidence & Personal Growth",
    bio: "Demo profile: Supports students who want to strengthen self-confidence, manage self-doubt, communicate more effectively, and approach setbacks with a constructive mindset.",
  },
  {
    id: "1bed011d-f501-4ba5-a41f-0f48c84a961c",
    name: "Dr. Rohan Mehta",
    specialty: "Emotional Well-being & Stress Management",
    bio: "Demo profile: Focuses on helping students understand everyday emotions, recognize sources of stress, develop healthy coping habits, and build confidence in handling challenging situations.",
  },
  {
    id: "576ca231-0518-4dc8-9de8-2ee53c2b3248",
    name: "Neha Kulkarni",
    specialty: "Relationships, Communication & Adjustment",
    bio: "Demo profile: Provides a supportive space for exploring friendship challenges, communication difficulties, college adjustment, and balancing academic responsibilities with social life.",
  },
  {
    id: "c4a09d80-3b7d-4425-af74-c1f18335eae2",
    name: "Priya Desai",
    specialty: "Study Habits & Time Management",
    bio: "Demo profile: Offers student-focused guidance on planning study sessions, managing competing deadlines, overcoming procrastination, setting achievable goals, and creating sustainable daily routines.",
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

  // Generate 18 showcase slots per counsellor: two slots on each of the next nine non-Sunday days.
  let workingDaysAdded = 0;
  for (let dayOffset = 1; workingDaysAdded < WORKING_DAYS_AHEAD; dayOffset += 1) {
    const date = addCalendarDays(today, dayOffset);
    if (isSunday(date)) continue;
    workingDaysAdded += 1;

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
