import { BlogPost, Author } from "@/types/blog";

export interface DbPostWithAuthor {
  id: string;
  title: string;
  content: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  author: {
    id: string;
    name: string;
    email: string;
    createdAt?: Date | string;
  };
}

// Curated high-resolution editorial photography for post card thumbnails
const EDITORIAL_COVERS = [
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80",
];

// Curated high-resolution male avatars (professional portraits)
const MALE_AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&q=80",
];

// Curated high-resolution female avatars (professional portraits)
const FEMALE_AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80",
  "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=256&q=80",
];

/**
 * Intelligent gender detector based on author name heuristics and common name sets.
 */
export function detectGenderFromName(name: string): "male" | "female" {
  if (!name) return "male";
  const firstName = name.trim().split(/\s+/)[0].toLowerCase();

  // Known female first names
  const femaleNames = new Set([
    "ananya", "priya", "kavitha", "pooja", "sneha", "divya", "lakshmi", "maya",
    "deepa", "swati", "meera", "radha", "aishwarya", "shreya", "anjali", "neha",
    "ritu", "sunita", "geeta", "rekha", "roshni", "tanvi", "aditi", "riya",
    "shruti", "pallavi", "vidya", "bhavana", "keerthi", "sarah", "emily",
    "jessica", "maria", "emma", "olivia", "sophia", "ava", "isabella", "mia",
    "charlotte", "amelia", "harper", "evelyn", "abigail", "elizabeth", "ella",
    "avery", "sofia", "camila", "aaliyah", "chloe", "anna", "victoria", "grace",
    "zoey", "natalie", "hannah", "lily", "lillian", "laura", "rachel", "lisa",
    "elena", "claire", "alice", "amy", "angela", "ashley", "barbara", "betty",
    "carol", "catherine", "christine", "diana", "donna", "dorothy", "helen",
    "jennifer", "judith", "karen", "kimberly", "margaret", "nancy", "pamela",
    "sandra", "sharon", "shirley", "stephanie", "susan", "theresa", "virginia"
  ]);

  // Known male first names
  const maleNames = new Set([
    "denesh", "deneshwaran", "yogeesh", "arjun", "rahul", "vikram", "amit",
    "rohit", "suresh", "ramesh", "vijay", "ajay", "karthik", "sanjay", "deepak",
    "rajesh", "manoj", "john", "david", "michael", "alex", "james", "robert",
    "william", "joseph", "thomas", "charles", "daniel", "matthew", "anthony",
    "mark", "donald", "steven", "paul", "andrew", "joshua", "kevin", "brian",
    "george", "edward", "ronald", "timothy", "jason", "jeffrey", "ryan", "jacob",
    "nicholas", "eric", "stephen", "larry", "justin", "scott", "brandon", "benjamin",
    "samuel", "gregory", "frank", "alexander", "raymond", "patrick", "jack", "dennis"
  ]);

  if (femaleNames.has(firstName)) return "female";
  if (maleNames.has(firstName)) return "male";

  // Common feminine suffixes (unless known male like Joshua/Luca)
  if (
    firstName.endsWith("a") ||
    firstName.endsWith("i") ||
    firstName.endsWith("ya") ||
    firstName.endsWith("ee") ||
    firstName.endsWith("ah") ||
    firstName.endsWith("ine") ||
    firstName.endsWith("ette") ||
    firstName.endsWith("elle") ||
    firstName.endsWith("ita") ||
    firstName.endsWith("ika")
  ) {
    if (["joshua", "luca", "ezra", "eli", "ravi", "hari", "ali"].includes(firstName)) {
      return "male";
    }
    return "female";
  }

  // Consistent deterministic fallback based on character code sum
  let sum = 0;
  for (let i = 0; i < firstName.length; i++) {
    sum += firstName.charCodeAt(i);
  }
  return sum % 2 === 0 ? "male" : "female";
}

/**
 * Extracts author role and category metadata from content if embedded via
 * `<!-- author_role: ... -->` and `<!-- category: ... -->`.
 */
export function extractMetadataAndContent(
  rawContent: string,
  authorName: string,
  title = ""
): {
  cleanContent: string;
  role: string;
  category: string;
} {
  const content = rawContent || "";

  // 1. Extract author_role tag
  const roleMatch = content.match(/<!--\s*author_role:\s*([^>]+?)\s*-->/i);
  let role = roleMatch ? roleMatch[1].trim() : "";

  // 2. Extract category tag
  const categoryMatch = content.match(/<!--\s*category:\s*([^>]+?)\s*-->/i);
  let category = categoryMatch ? categoryMatch[1].trim() : "";

  // Remove comment tags from clean rendered prose
  const cleanContent = content
    .replace(/<!--\s*author_role:\s*([^>]+?)\s*-->\r?\n?/gi, "")
    .replace(/<!--\s*category:\s*([^>]+?)\s*-->\r?\n?/gi, "")
    .trim();

  // Role fallback
  if (!role) {
    if (authorName.toLowerCase().includes("deneshwaran")) {
      role = "Software Engineer";
    } else {
      role = "Writer";
    }
  }

  // Category fallback heuristic based on title and content if not explicitly tagged
  if (!category) {
    const textToCheck = `${title} ${cleanContent}`.toLowerCase();
    if (/\b(design|ui|ux|typography|visual|tactile|spatial|figma)\b/i.test(textToCheck)) {
      category = "Design";
    } else if (/\b(ai|artificial intelligence|machine learning|deep learning|neural|llm|gpt)\b/i.test(textToCheck)) {
      category = "Artificial Intelligence";
    } else if (/\b(quantum|qubit|qiskit|physics)\b/i.test(textToCheck)) {
      category = "Engineering";
    } else if (/\b(microservices|kubernetes|pipeline|architecture|database|backend|cloud|distributed)\b/i.test(textToCheck)) {
      category = "Engineering";
    } else if (/\b(minimalist|publishing|culture|essay|craft|philosophy|mindfulness)\b/i.test(textToCheck)) {
      category = "Culture";
    } else if (/\b(productivity|habits|workflow|velocity)\b/i.test(textToCheck)) {
      category = "Productivity";
    } else {
      category = "Technology";
    }
  }

  return { cleanContent, role, category };
}

/**
 * Backwards compatibility helper for extracting role.
 */
export function extractAuthorRoleAndContent(rawContent: string, authorName: string): {
  cleanContent: string;
  role: string;
} {
  const { cleanContent, role } = extractMetadataAndContent(rawContent, authorName);
  return { cleanContent, role };
}

/**
 * Adapts a raw PostgreSQL database post with its author into the BlogPost
 * interface expected by existing editorial UI components.
 * Derives excerpt, reading time, and formatted dates naturally from content and createdAt.
 */
export function adaptDbPostToBlogPost(
  dbPost: DbPostWithAuthor,
  index = 0
): BlogPost {
  const rawContent = dbPost.content || "";
  const authorName = dbPost.author?.name || "Anonymous Author";

  const { cleanContent, role, category } = extractMetadataAndContent(
    rawContent,
    authorName,
    dbPost.title
  );

  const wordCount = cleanContent.split(/\s+/).filter(Boolean).length;
  const readingTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

  const dateObj = new Date(dbPost.createdAt);
  const publishedAt = !isNaN(dateObj.getTime())
    ? dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  // Derive readable excerpt from clean prose content
  const cleanExcerpt =
    cleanContent
      .replace(/^[#>\s*-]+/gm, "")
      .replace(/```[\s\S]*?```/g, "")
      .trim()
      .slice(0, 180) + (cleanContent.length > 180 ? "..." : "");

  // Deterministic seed based on post ID and author name
  const charSum = (dbPost.id + authorName)
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), index);

  const coverImage = EDITORIAL_COVERS[charSum % EDITORIAL_COVERS.length];

  // Avatar selection:
  // 1. If author is Deneshwaran M -> use the uploaded user photo!
  // 2. Otherwise -> detect gender according to author name and choose appropriate portrait!
  let avatar = "";
  let bio = "";

  const isDeneshwaran = authorName.toLowerCase().includes("deneshwaran");

  if (isDeneshwaran) {
    avatar = "/authors/deneshwaran.jpg";
    bio = "Software Engineer at BlogSpace. Building scalable systems, tactile user experiences, and thoughtful engineering craft.";
  } else {
    const gender = detectGenderFromName(authorName);
    const avatarList = gender === "female" ? FEMALE_AVATARS : MALE_AVATARS;
    avatar = avatarList[charSum % avatarList.length];
    bio = `${role} at BlogSpace. Sharing insights, research, and creative perspectives with the community.`;
  }

  const author: Author = {
    id: dbPost.author.id,
    name: authorName,
    avatar,
    role,
    bio,
  };

  return {
    id: dbPost.id,
    slug: dbPost.id, // Using post.id for direct, unambiguous routing
    title: dbPost.title,
    excerpt: cleanExcerpt || "No excerpt provided.",
    content: cleanContent,
    coverImage,
    category,
    tags: [category, role],
    author,
    publishedAt,
    readingTime,
    featured: index === 0,
    likesCount: 0,
    commentsCount: 0,
  };
}
