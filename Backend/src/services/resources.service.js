import prisma from "../db/prisma.js";

// Translate the database model into the shape already consumed by the frontend.
function toResourceDto(resource) {
  let source = "MindCare library";

  if (resource.externalUrl) {
    try {
      const hostname = new URL(resource.externalUrl).hostname
        .toLowerCase()
        .replace(/^www\./, "");

      if (hostname === "who.int" || hostname.endsWith(".who.int")) {
        source = "World Health Organization";
      } else if (hostname === "nimh.nih.gov") {
        source = "National Institute of Mental Health";
      } else if (hostname === "nhs.uk" || hostname.endsWith(".nhs.uk")) {
        source = "NHS Every Mind Matters";
      } else {
        source = hostname;
      }
    } catch {
      // Keep the safe default label if legacy data contains an invalid URL.
    }
  }

  return {
    id: resource.id,
    title: resource.title,
    category: resource.category,
    content: resource.content,
    summary: resource.content,
    description: resource.content,
    externalUrl: resource.externalUrl,
    sourceUrl: resource.externalUrl,
    url: resource.externalUrl,
    source,
    createdAt: resource.createdAt,
  };
}

// Search is bounded to a small, fixed result set to keep the endpoint predictable.
export async function getResources({ search = "", category = "" } = {}) {
  const where = {};

  if (category) {
    where.category = { equals: category, mode: "insensitive" };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { category: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }

  const resources = await prisma.resource.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { title: "asc" }],
    take: 50,
  });

  return resources.map(toResourceDto);
}

export async function getResourceById(resourceId) {
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
  });

  if (!resource) {
    const error = new Error("Resource not found.");
    error.statusCode = 404;
    throw error;
  }

  return toResourceDto(resource);
}
