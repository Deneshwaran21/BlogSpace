import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.post.findMany({
    select: { id: true, title: true, content: true, author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  posts.forEach((p, i) => {
    const firstLines = p.content.slice(0, 150).replace(/\n/g, " ");
    console.log(`[${i + 1}] "${p.title}" by ${p.author.name}`);
    console.log(`    Content preview: ${firstLines}\n`);
  });
}

main().finally(() => prisma.$disconnect());
