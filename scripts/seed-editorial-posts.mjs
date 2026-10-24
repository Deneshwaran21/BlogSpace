import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const samplePosts = [
  {
    title: "Architectural Patterns for Resilient Microservices",
    content: `<!-- author_role: Software Engineer -->
Modern cloud systems require architectures that fail gracefully rather than catastrophically. When designing distributed systems with microservices, the primary adversary is cascading failures across network boundaries.

In this deep dive, we explore event-driven architecture with Apache Kafka, automated circuit breakers, and distributed tracing. Implementing deterministic bulkhead isolation prevents a single degraded service from bringing down your entire application cluster.

Kubernetes and modern service meshes provide ingress traffic shaping, but architectural resilience must be built directly into the application code with idempotent operations, retries with exponential backoff, and robust telemetry.`,
    authorEmail: "denesh@gmail.com",
    fallbackAuthorName: "Deneshwaran M",
  },
  {
    title: "Tactile Design Systems in the Age of Spatial Computing",
    content: `<!-- author_role: Designer -->
As user interfaces evolve from flat glass screens toward spatial environments, physical metaphors and tactile feedback become essential design principles. The subtle interplay of light, elevation, and typography grounds users in digital spaces.

In this essay, we examine how modern design tokens in Figma can bridge the gap between two-dimensional typography and three-dimensional spatial layouts. We break down glassmorphism shaders, ergonomic hit areas, and accessible contrast ratios.

Great interface design is not merely decoration—it is the intuitive communication of intent, affordance, and delight.`,
    authorEmail: "maya@blogspace.io",
    fallbackAuthorName: "Maya Sharma",
  },
  {
    title: "The Quantum Computing Horizon: What Developers Need to Know",
    content: `<!-- author_role: Hacker -->
Quantum algorithms are rapidly advancing from academic physics labs to practical cryptographic and computational challenges. While classical computers rely on binary bits, qubits exploit superposition and entanglement.

We explore quantum circuit design using IBM Qiskit, the mathematics of Shor's and Grover's algorithms, and post-quantum cryptography standards. Developers preparing for the next decade must understand how lattice-based cryptography will protect sensitive communications against quantum decryption.

The transition to quantum-safe systems is not an emergency for tomorrow—it is an engineering discipline that starts today.`,
    authorEmail: "alex@blogspace.io",
    fallbackAuthorName: "Alex Rivera",
  },
  {
    title: "Modern CSS Architecture: Cascade Layers and Container Queries",
    content: `<!-- author_role: Software Engineer -->
For years, managing CSS specificity at scale required naming conventions like BEM or CSS-in-JS abstractions. With native cascade layers (@layer) and container queries (@container), the web platform now offers native solutions to styling complexity.

We break down how to organize utility styles, component styles, and reset rules into distinct cascade layers. Furthermore, container queries enable truly responsive components that adapt to their parent container rather than arbitrary viewport dimensions.

By embracing modern CSS primitives, frontend teams can dramatically reduce bundle size, eliminate runtime CSS execution overhead, and build elegant layouts.`,
    authorEmail: "denesh@gmail.com",
    fallbackAuthorName: "Deneshwaran M",
  },
  {
    title: "AI-Assisted Engineering: Balancing Velocity and Code Craft",
    content: `<!-- author_role: Analyst -->
Generative artificial intelligence has transformed the day-to-day workflow of software engineers. While code completion and automated boilerplate generation accelerate delivery, true engineering craft remains indispensable.

In this comprehensive report, we analyze developer productivity metrics across 500 engineering teams adopting AI pair programmers. The data reveals that while initial drafting speed increases by 40%, senior review and static analysis rigor become even more critical to prevent architectural drift and security vulnerabilities.

Automated tools empower engineers to think at higher levels of abstraction, but human taste, discernment, and system architecture remain irreplaceable.`,
    authorEmail: "priya@blogspace.io",
    fallbackAuthorName: "Priya Patel",
  },
  {
    title: "The Philosophy of Minimalist Digital Publishing",
    content: `<!-- author_role: Writer -->
In an internet inundated with intrusive ads, modal banners, and tracking scripts, reading long-form essays has become an exercise in sensory overload. Digital publishing deserves a return to calm, focused craftsmanship.

This essay explores the historical roots of editorial typography, from the classic proportions of the Golden Ratio to modern serif typefaces optimized for high-density OLED displays. When margins breathe, line heights harmonize, and prose takes center stage, readers rediscover the joy of uninterrupted thought.

BlogSpace was designed with this exact ethos: editorial elegance, speed, and absolute respect for the reader's attention.`,
    authorEmail: "denesh@gmail.com",
    fallbackAuthorName: "Deneshwaran M",
  },
  {
    title: "Building High-Throughput Event-Driven Pipelines",
    content: `<!-- author_role: Software Engineer -->
Processing millions of events per second with sub-millisecond latency requires thoughtful partitioning, zero-copy serialization, and robust fault-tolerance mechanisms.

In this technical breakdown, we analyze event sourcing architectures, log-structured storage engines, and backpressure management. Learn how to design distributed worker pools that scale dynamically without risking message loss or data corruption.

Engineering high-throughput data streams is both an art and a science, requiring rigorous benchmarking, memory profiling, and edge-case testing under partition failure scenarios.`,
    authorEmail: "alex@blogspace.io",
    fallbackAuthorName: "Alex Rivera",
  },
];

async function main() {
  console.log("Seeding sample editorial posts for pagination & search testing...");

  for (const postData of samplePosts) {
    // Check if post already exists
    const existing = await prisma.post.findFirst({
      where: { title: postData.title },
    });

    if (existing) {
      console.log(`Post already exists: "${postData.title}"`);
      continue;
    }

    // Find or create author
    let author = await prisma.user.findUnique({
      where: { email: postData.authorEmail },
    });

    if (!author) {
      author = await prisma.user.create({
        data: {
          email: postData.authorEmail,
          name: postData.fallbackAuthorName,
          passwordHash: "$2a$10$sampleHashNotForLoginSeedOnly123456789012345678901234",
        },
      });
      console.log(`Created author: ${author.name} (${author.email})`);
    }

    const created = await prisma.post.create({
      data: {
        title: postData.title,
        content: postData.content,
        authorId: author.id,
      },
    });

    console.log(`Created post: "${created.title}" [id: ${created.id}]`);
  }

  const count = await prisma.post.count();
  console.log(`Done! Total posts in database now: ${count}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
