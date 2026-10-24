import { BlogPost, Author } from "@/types/blog";

export const mockAuthors: Record<string, Author> = {
  elena: {
    id: "author-1",
    name: "Elena Rostova",
    role: "Staff Design Systems Engineer",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    bio: "Obsessed with typography, micro-interactions, and accessible design architectures. Previously lead designer at Monoform.",
    twitter: "@elenarostova",
    github: "elenarostova",
  },
  marcus: {
    id: "author-2",
    name: "Marcus Vance",
    role: "Principal Distributed Systems Architect",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
    bio: "Writing about modern web performance, edge networks, and resilient multi-region infrastructure patterns.",
    twitter: "@marcusvance",
    github: "marcusvance",
  },
  sophia: {
    id: "author-3",
    name: "Dr. Sophia Chen",
    role: "AI Research Lead & Ethicist",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80",
    bio: "Investigating reasoning capabilities in frontier models and practical neuro-symbolic integrations for human-centric tools.",
    twitter: "@sophiachen_ai",
    github: "schen-research",
  },
  devon: {
    id: "author-4",
    name: "Devon Reed",
    role: "Editorial Director & Essayist",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
    bio: "Chronicling the intersection of creative work, digital mindfulness, and modern craftsmanship.",
    twitter: "@devonreed",
  },
};

export const mockPosts: BlogPost[] = [
  {
    id: "post-1",
    slug: "future-of-editorial-web-design",
    title: "The Architecture of Editorial Elegance in Modern Web Interfaces",
    excerpt: "How blending traditional print typographic hierarchy with fluid modern web primitives creates reading experiences that command attention without shouting.",
    coverImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80",
    category: "Design",
    tags: ["Typography", "Design Systems", "UX", "Web Standards"],
    author: mockAuthors.elena,
    publishedAt: "Oct 20, 2026",
    readingTime: "6 min read",
    featured: true,
    likesCount: 342,
    commentsCount: 28,
    content: `
Editorial design has entered an exhilarating renaissance. For the better part of the past decade, web interfaces surrendered to homogenous component libraries, clinical grey boxes, and relentless utility-first layouts. While this standardized usability, it inadvertently stripped digital publishing of its distinct literary soul.

### The Return of Typographic Dignity

When you open a meticulously typeset printed quarterly or an archival art monograph, you are immediately struck by conscious rhythm. Contrast is not merely calculated through color hex codes; it is orchestrated through variable type weight, proportional line height, and intentional whitespace margins that let thoughts breathe.

> "A great digital essay should feel like sitting down with a bespoke hardbound volume: deliberate, immersive, and resistant to hasty skimming."

In our recent redesign explorations at BlogSpace, we prioritized three core tenets:
1. **Dynamic Optical Sizing**: Utilizing variable font axes that adjust tracking and optical kerning as viewport dimensions shift.
2. **Harmonious Baseline Grids**: Aligning figures, callouts, and lead-in paragraphs to a consistent rhythmic cadence.
3. **Respect for Reader Focus**: Eliminating aggressive popups, floating counters, and distracting peripheral clutter.

\`\`\`css
/* Fluid editorial typography scale */
:root {
  --font-fluid-lead: clamp(1.25rem, 1.1rem + 0.75vw, 1.75rem);
  --line-height-prose: 1.78;
  --letter-spacing-editorial: -0.015em;
}

.editorial-body {
  font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
  text-rendering: optimizeLegibility;
}
\`\`\`

### Crafting the Tactile Surface

Digital readers are sophisticated. They instinctively appreciate subtle nuances—such as warm off-white canvas backgrounds rather than blinding sterile #FFFFFF, or whisper-soft borders that structure content without harsh delineation.

As we move deeper into the decade, the publishers who endure will not be those who publish the most volume, but those who honor the craft of the written word with unmatched presentation standards.
    `,
    comments: [
      {
        id: "c1",
        authorName: "Julian Thorne",
        authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
        date: "2 days ago",
        content: "Spot on about optical sizing. When typography breathes naturally, session read times visibly double.",
        likes: 14,
      },
      {
        id: "c2",
        authorName: "Claire Dupont",
        authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
        date: "Yesterday",
        content: "Love the CSS snippet! Integrating fluid typography with baseline rhythm is something most modern sites forget.",
        likes: 9,
      },
    ],
  },
  {
    id: "post-2",
    slug: "engineering-zero-latency-edge-apis",
    title: "Engineering Zero-Latency Architectures for Global Content Delivery",
    excerpt: "Dissecting how multi-region caching, partial pre-rendering, and intelligent edge worker topologies deliver instantaneous page loads worldwide.",
    coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
    category: "Engineering",
    tags: ["Performance", "Edge Computing", "Next.js", "Cloud"],
    author: mockAuthors.marcus,
    publishedAt: "Oct 18, 2026",
    readingTime: "8 min read",
    likesCount: 215,
    commentsCount: 16,
    content: `
Latency is the silent killer of user engagement. When serving global audiences spanning Tokyo, London, São Paulo, and San Francisco, single-region centralized servers introduce unacceptable physics-constrained latency delays.

### The Shift to Edge Proximity

By distributing compute and static generation directly to points-of-presence (PoPs) within 15 milliseconds of 95% of world internet users, content applications can deliver sub-100ms time-to-first-byte (TTFB).

\`\`\`typescript
// Edge handler routing pattern
export const config = {
  runtime: 'edge',
  regions: ['iad1', 'hnd1', 'lhr1', 'syd1'],
};

export default async function handler(req: Request) {
  const cacheKey = new URL(req.url).pathname;
  const staleWhileRevalidate = 86400; // 24 hours
  
  return new Response(await getCachedArticle(cacheKey), {
    headers: {
      'Cache-Control': \`public, s-maxage=3600, stale-while-revalidate=\${staleWhileRevalidate}\`,
      'Content-Type': 'application/json',
    },
  });
}
\`\`\`

### Key Benchmarks
In our stress testing across 50,000 synthetic requests:
- **Centralized Origin (US-East)**: Global average latency was 410ms.
- **Edge Cache + Distributed Revalidation**: Global average latency plummeted to 42ms.

The benefits extend beyond raw speed; resilience against localized network outages improves exponentially when edge nodes failover gracefully.
    `,
  },
  {
    id: "post-3",
    slug: "frontier-reasoning-models-and-editorial-tools",
    title: "Frontier Reasoning Models: Reimagining the Writer's Workbench",
    excerpt: "Why the next wave of generative AI is not about replacing prose, but augmenting human research, citation verification, and conceptual outlining.",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    category: "Artificial Intelligence",
    tags: ["AI", "Research", "Workflow", "Ethics"],
    author: mockAuthors.sophia,
    publishedAt: "Oct 15, 2026",
    readingTime: "10 min read",
    likesCount: 520,
    commentsCount: 42,
    content: `
A common anxiety surrounding artificial intelligence in publishing is the homogenizing flood of automated, soulless content. Yet when wielded by thoughtful essayists and investigative journalists, modern reasoning models function as cognitive scaffolding.

### Beyond Autocomplete: Deep Inquiry Engines

Rather than asking an LLM to "write a 1,000-word post about X," our researchers utilize models as dialectical sparring partners:
- Stress-testing weak assumptions in an argument
- Unearthing obscure academic citations across multidisciplinary journals
- Identifying counterarguments before publishing high-stakes analysis

> "The true measure of a cognitive assistant is not how much text it generates, but how much clearer your independent thinking becomes."

As responsible curators, maintaining transparent editorial provenance will become the definitive mark of trustworthy publications.
    `,
  },
  {
    id: "post-4",
    slug: "cultivating-deep-work-in-an-epoch-of-noise",
    title: "Cultivating Deep Work & Digital Sanity in an Epoch of Relentless Noise",
    excerpt: "Practical rituals, deliberate friction, and structural boundaries for writers and creators navigating the attention economy.",
    coverImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80",
    category: "Productivity",
    tags: ["Deep Work", "Mindfulness", "Writing", "Habits"],
    author: mockAuthors.devon,
    publishedAt: "Oct 12, 2026",
    readingTime: "5 min read",
    likesCount: 184,
    commentsCount: 12,
    content: `
Attention is finite, precious, and relentlessly monetized. Every push notification, algorithmic feed, and badge counter has been engineered to fracture sustained concentration.

### The 90-Minute Hermetic Chamber

Over the past four years of writing daily essays, I instituted a non-negotiable morning ritual:
- **Physical analog notebook** for the first 30 minutes after waking.
- **Air-gapped writing environment** (no browser tabs, Slack silenced).
- **One solitary creative objective** completed before triage mode begins.

By defending the morning hours as sacred creative territory, writing ceases to feel like an uphill battle and transforms into an act of sustained discovery.
    `,
  },
  {
    id: "post-5",
    slug: "mastering-typescript-in-large-scale-applications",
    title: "Idiomatic TypeScript Patterns for Scalable Frontend Systems",
    excerpt: "From template literal types to discriminated unions and branded primitives, elevate your type safety without sacrificing developer ergonomics.",
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
    category: "Technology",
    tags: ["TypeScript", "Frontend", "Clean Code", "Architecture"],
    author: mockAuthors.marcus,
    publishedAt: "Oct 08, 2026",
    readingTime: "7 min read",
    likesCount: 298,
    commentsCount: 19,
    content: `
TypeScript has fundamentally transformed how we approach client-side reliability. Yet many development teams find themselves trapped between two extremes: either wrestling with overly convoluted generic gymnastics, or retreating to liberal uses of \`any\` and \`unknown\`.

### Discriminated Unions Over Optional Chaos

Consider the classic state handling in asynchronous UI:

\`\`\`typescript
// Anti-pattern: Ambiguous states
interface BadState<T> {
  data?: T;
  error?: Error;
  isLoading: boolean;
}

// Recommended: Discriminated Union
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };
\`\`\`

With discriminated unions, TypeScript eliminates impossible UI states at compile time, guaranteeing that access to \`data\` cannot occur when the request is still loading or in error state.
    `,
  },
  {
    id: "post-6",
    slug: "the-craft-of-micro-interactions",
    title: "The Craft of Micro-Interactions: Why Details Define Digital Delight",
    excerpt: "Exploring the psychology, timing curves, and sensory feedback that elevate routine clicks into memorable moments of user joy.",
    coverImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
    category: "Design",
    tags: ["Animation", "CSS", "Micro-Interactions", "UX"],
    author: mockAuthors.elena,
    publishedAt: "Oct 04, 2026",
    readingTime: "4 min read",
    likesCount: 412,
    commentsCount: 31,
    content: `
Great software rarely distinguishes itself solely through headline features. More often, user loyalty is forged through the hundred invisible courtesies tucked into everyday interactions: the gentle resistance of a toggle switch, the spring-loaded cadence of a drawer opening, or the subtle celebratory sparkle when completing an objective.

### The Physics of Animation

Mechanical linear transitions feel robotic and jarring. Human beings are accustomed to physical forces—momentum, friction, and gravity.

- **Ease-out** for elements entering the viewport: quick arrival with gentle deceleration.
- **Ease-in** for departures: immediate acknowledgment followed by rapid exit.
- **Spring dampening** for direct interactive manipulation like sliders or pull-to-refresh.

Small touches remind the user that behind the software is a human craftsperson who cared deeply about their comfort.
    `,
  },
];

export const mockCategories: string[] = [
  "All",
  "Design",
  "Technology",
  "Engineering",
  "Artificial Intelligence",
  "Productivity",
  "Culture",
];

// Helper functions for mock data
export function getAllPosts(): BlogPost[] {
  return mockPosts;
}

export function getFeaturedPost(): BlogPost | undefined {
  return mockPosts.find((p) => p.featured) || mockPosts[0];
}

export function getRecentPosts(): BlogPost[] {
  return mockPosts.filter((p) => !p.featured);
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return mockPosts.find((p) => p.slug === slug);
}

export function getPostById(id: string): BlogPost | undefined {
  return mockPosts.find((p) => p.id === id);
}

export function getRelatedPosts(currentSlug: string, category: string, limit = 3): BlogPost[] {
  return mockPosts
    .filter((p) => p.slug !== currentSlug && p.category === category)
    .slice(0, limit)
    .concat(
      mockPosts
        .filter((p) => p.slug !== currentSlug && p.category !== category)
        .slice(0, Math.max(0, limit - mockPosts.filter((p) => p.slug !== currentSlug && p.category === category).length))
    )
    .slice(0, limit);
}
