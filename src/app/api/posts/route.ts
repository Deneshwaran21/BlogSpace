import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getSession } from "@/lib/auth";

// Safe author fields to select (never expose passwordHash)
const SAFE_AUTHOR_SELECT = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
} as const;

/**
 * GET /api/posts
 * Retrieves paginated posts with safe author info and optional search filtering.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    // Read query parameters
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const searchParam = searchParams.get("search");
    const authorIdParam = searchParams.get("authorId");
    const categoryParam = searchParams.get("category");
    const allParam = searchParams.get("all");

    // Check for authenticated session (if any)
    const session = await getSession();

    let page = 1;
    if (pageParam !== null) {
      const parsedPage = parseInt(pageParam, 10);
      if (isNaN(parsedPage) || parsedPage < 1) {
        return NextResponse.json(
          { error: "Query parameter 'page' must be a positive integer." },
          { status: 400 }
        );
      }
      page = parsedPage;
    }

    let limit = 10;
    if (limitParam !== null) {
      const parsedLimit = parseInt(limitParam, 10);
      if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
        return NextResponse.json(
          { error: "Query parameter 'limit' must be an integer between 1 and 50." },
          { status: 400 }
        );
      }
      limit = parsedLimit;
    }

    const skip = (page - 1) * limit;

    // Build Prisma where clause based on supported schema fields
    // Strict requirement: "if i signin only my blog should be shown. in common page(without signin) only every blog should be listed"
    const where: Prisma.PostWhereInput = {};

    // 1. Author Filter:
    // - If authorId="all" or all="true": show every blog (common listing)
    // - If explicit authorId: filter by that authorId
    // - If user is signed in: show ONLY their blogs
    // - If visitor is not signed in: show every blog
    if (authorIdParam && authorIdParam !== "all") {
      where.authorId = authorIdParam.trim();
    } else if (!authorIdParam && allParam !== "true" && session?.userId) {
      where.authorId = session.userId;
    }

    // 2. Search & Category Filters:
    const andConditions: Prisma.PostWhereInput[] = [];

    if (categoryParam && categoryParam.trim() && categoryParam.trim() !== "All") {
      const cleanCat = categoryParam.trim();
      andConditions.push({
        OR: [
          { content: { contains: `category: ${cleanCat}`, mode: "insensitive" } },
          { content: { contains: cleanCat, mode: "insensitive" } },
          { title: { contains: cleanCat, mode: "insensitive" } },
        ],
      });
    }

    if (searchParam && typeof searchParam === "string" && searchParam.trim()) {
      const cleanSearch = searchParam.trim();
      andConditions.push({
        OR: [
          { title: { contains: cleanSearch, mode: "insensitive" } },
          { content: { contains: cleanSearch, mode: "insensitive" } },
        ],
      });
    }

    if (andConditions.length === 1) {
      Object.assign(where, andConditions[0]);
    } else if (andConditions.length > 1) {
      where.AND = andConditions;
    }

    // Execute count and query concurrently
    const [totalCount, posts] = await Promise.all([
      prisma.post.count({ where }),
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: SAFE_AUTHOR_SELECT,
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit) || 1;
    const hasMore = page < totalPages;

    return NextResponse.json(
      {
        posts,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasMore,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      typeof (error as { digest: unknown }).digest === "string" &&
      (error as { digest: string }).digest.startsWith("NEXT_")
    ) {
      throw error;
    }

    console.error("GET /api/posts error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve posts." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/posts
 * Creates a new blog post. Requires an authenticated user session.
 * The authorId is strictly derived from the verified session.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify authenticated session
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json(
        { error: "Unauthorized. You must be signed in to create a post." },
        { status: 401 }
      );
    }

    // 2. Ensure author still exists in PostgreSQL
    const author = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true },
    });

    if (!author) {
      return NextResponse.json(
        { error: "Unauthorized. User account no longer exists." },
        { status: 401 }
      );
    }

    // 3. Parse and validate JSON body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Request body must be a JSON object." },
        { status: 400 }
      );
    }

    const { title, content } = body as Record<string, unknown>;

    // 4. Validate fields
    if (typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required and must be a string." },
        { status: 400 }
      );
    }

    const normalizedTitle = title.trim();
    if (normalizedTitle.length < 3 || normalizedTitle.length > 200) {
      return NextResponse.json(
        { error: "Title must be between 3 and 200 characters in length." },
        { status: 400 }
      );
    }

    if (typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required and must be a string." },
        { status: 400 }
      );
    }

    const normalizedContent = content.trim();
    if (normalizedContent.length < 10) {
      return NextResponse.json(
        { error: "Content must be at least 10 characters long." },
        { status: 400 }
      );
    }

    if (normalizedContent.length > 100000) {
      return NextResponse.json(
        { error: "Content exceeds maximum limit of 100,000 characters." },
        { status: 400 }
      );
    }

    // 5. Create post in database with authorId from verified session
    const post = await prisma.post.create({
      data: {
        title: normalizedTitle,
        content: normalizedContent,
        authorId: session.userId,
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: SAFE_AUTHOR_SELECT,
        },
      },
    });

    return NextResponse.json(
      {
        message: "Post created successfully.",
        post,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("POST /api/posts error:", error);
    return NextResponse.json(
      { error: "Failed to create post. Please try again." },
      { status: 500 }
    );
  }
}
