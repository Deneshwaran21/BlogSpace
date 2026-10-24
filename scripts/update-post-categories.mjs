import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categoryUpdates = [
  {
    titleMatch: "The Principles of Good Digital Design",
    category: "Design",
    role: "Software Engineer",
  },
  {
    titleMatch: "Tactile Design Systems",
    category: "Design",
    role: "Designer",
  },
  {
    titleMatch: "India's AI Revolution",
    category: "Artificial Intelligence",
    role: "Software Engineer",
  },
  {
    titleMatch: "AI-Assisted Engineering",
    category: "Artificial Intelligence",
    role: "Analyst",
  },
  {
    titleMatch: "Quantum Computing Horizon",
    category: "Engineering",
    role: "Hacker",
  },
  {
    titleMatch: "Architectural Patterns for Resilient Microservices",
    category: "Engineering",
    role: "Software Engineer",
  },
  {
    titleMatch: "Building High-Throughput Event-Driven Pipelines",
    category: "Engineering",
    role: "Software Engineer",
  },
  {
    titleMatch: "Modern CSS Architecture",
    category: "Technology",
    role: "Software Engineer",
  },
  {
    titleMatch: "The Philosophy of Minimalist Digital Publishing",
    category: "Culture",
    role: "Writer",
  },
];

async function main() {
  console.log("Updating post categories and roles in database...");

  const allPosts = await prisma.post.findMany();

  for (const post of allPosts) {
    const updateDef = categoryUpdates.find(u => post.title.toLowerCase().includes(u.titleMatch.toLowerCase()));
    
    // Strip existing comment tags if any
    let cleanContent = post.content
      .replace(/<!--\s*author_role:\s*([^>]+?)\s*-->\r?\n?/gi, "")
      .replace(/<!--\s*category:\s*([^>]+?)\s*-->\r?\n?/gi, "")
      .trim();

    const category = updateDef?.category || "Technology";
    const role = updateDef?.role || "Software Engineer";

    const newContent = `<!-- category: ${category} -->\n<!-- author_role: ${role} -->\n\n${cleanContent}`;

    await prisma.post.update({
      where: { id: post.id },
      data: { content: newContent },
    });

    console.log(`✓ Updated "${post.title}" -> Category: [${category}], Role: [${role}]`);
  }

  console.log("Category update complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
