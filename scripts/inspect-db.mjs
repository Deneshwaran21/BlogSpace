import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
  });
  console.log("Users:", JSON.stringify(users, null, 2));

  const posts = await prisma.post.findMany({
    select: { id: true, title: true, createdAt: true, author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  console.log(`Total posts: ${posts.length}`);
  posts.forEach((p, i) => {
    console.log(`[${i + 1}] ${p.title} (by ${p.author.name})`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
