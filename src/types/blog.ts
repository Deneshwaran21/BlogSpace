export interface Author {
  id: string;
  name: string;
  avatar: string;
  role: string;
  bio: string;
  twitter?: string;
  github?: string;
}

export interface Comment {
  id: string;
  authorName: string;
  authorAvatar: string;
  date: string;
  content: string;
  likes: number;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  author: Author;
  publishedAt: string;
  readingTime: string;
  featured?: boolean;
  likesCount: number;
  commentsCount: number;
  comments?: Comment[];
}

export type BlogCategory = 
  | "All"
  | "Technology"
  | "Design"
  | "Engineering"
  | "Artificial Intelligence"
  | "Productivity"
  | "Culture";

export const WRITER_ROLES = [
  "Software Engineer",
  "Designer",
  "Creator",
  "Analyst",
  "Hacker",
  "Blogger",
  "Writer",
  "Artist",
] as const;

export type WriterRole = typeof WRITER_ROLES[number];

export interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  authorRole?: string;
  coverImage: string;
  tags: string;
  readingTime: string;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
}
