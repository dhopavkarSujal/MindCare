import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Seed a small, curated starter collection; stable IDs make this safe to rerun.
const resources = [
  {
    id: "b32a5fc0-4df9-4e44-97d4-b729ded8d001",
    title: "Doing What Matters in Times of Stress",
    category: "Stress & coping",
    content: "An illustrated guide with practical grounding and stress-management exercises.",
    externalUrl: "https://www.who.int/publications/i/item/9789240003927",
  },
  {
    id: "b32a5fc0-4df9-4e44-97d4-b729ded8d002",
    title: "Caring for Your Mental Health",
    category: "Everyday wellbeing",
    content: "Everyday practices and guidance for supporting mental wellbeing.",
    externalUrl: "https://www.nimh.nih.gov/health/topics/caring-for-your-mental-health",
  },
  {
    id: "b32a5fc0-4df9-4e44-97d4-b729ded8d003",
    title: "Mental wellbeing support",
    category: "Daily habits",
    content: "Practical ideas for managing stress, low mood, sleep and daily routines.",
    externalUrl: "https://www.nhs.uk/every-mind-matters/",
  },
];

async function main() {
  for (const resource of resources) {
    const { id, ...data } = resource;
    await prisma.resource.upsert({
      where: { id },
      create: resource,
      update: data,
    });
  }

  console.info(`Seeded ${resources.length} MindCare resources.`);
}

main()
  .catch((error) => {
    console.error("Failed to seed MindCare resources:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
