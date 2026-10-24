import { PrismaClient } from "@prisma/client";
import { adaptDbPostToBlogPost } from "../src/lib/postAdapter.js";

const prisma = new PrismaClient();

async function test() {
  const posts = await prisma.post.findMany({
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      author: { select: { id: true, name: true, email: true } },
    },
  });

  posts.forEach((p) => {
    const adapted = adaptDbPostToBlogPost(p);
    console.log(`[${adapted.category}] "${adapted.title}" (Author: ${adapted.author.name}, Role: ${adapted.author.role})`);
  });
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
