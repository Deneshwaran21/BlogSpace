import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const SAFE_AUTHOR_SELECT = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
} as const;

function isValidUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/**
 * GET /api/posts/[id]
 * Retrieves a single post by ID with safe author information.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string" || !isValidUuid(id)) {
      return NextResponse.json(
        { error: "Invalid post ID format. A valid UUID is required." },
        { status: 400 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { id },
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

    if (!post) {
      return NextResponse.json(
        { error: "Post not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ post }, { status: 200 });
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

    console.error("GET /api/posts/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve post." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/posts/[id]
 * Updates an existing post. Only the authenticated author of the post can update it.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string" || !isValidUuid(id)) {
      return NextResponse.json(
        { error: "Invalid post ID format. A valid UUID is required." },
        { status: 400 }
      );
    }

    // 1. Verify authenticated session
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json(
        { error: "Unauthorized. You must be signed in to edit a post." },
        { status: 401 }
      );
    }

    // 2. Parse and validate JSON body
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

    if (title === undefined && content === undefined) {
      return NextResponse.json(
        { error: "At least one field ('title' or 'content') must be provided to update." },
        { status: 400 }
      );
    }

    const updateData: { title?: string; content?: string } = {};

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return NextResponse.json(
          { error: "Title must be a non-empty string." },
          { status: 400 }
        );
      }
      const cleanTitle = title.trim();
      if (cleanTitle.length < 3 || cleanTitle.length > 200) {
        return NextResponse.json(
          { error: "Title must be between 3 and 200 characters in length." },
          { status: 400 }
        );
      }
      updateData.title = cleanTitle;
    }

    if (content !== undefined) {
      if (typeof content !== "string" || !content.trim()) {
        return NextResponse.json(
          { error: "Content must be a non-empty string." },
          { status: 400 }
        );
      }
      const cleanContent = content.trim();
      if (cleanContent.length < 10) {
        return NextResponse.json(
          { error: "Content must be at least 10 characters long." },
          { status: 400 }
        );
      }
      if (cleanContent.length > 100000) {
        return NextResponse.json(
          { error: "Content exceeds maximum limit of 100,000 characters." },
          { status: 400 }
        );
      }
      updateData.content = cleanContent;
    }

    // 3. Check post existence and verify ownership
    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        authorId: true,
      },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: "Post not found." },
        { status: 404 }
      );
    }

    // 4. Strict authorization check: only the author can update
    if (existingPost.authorId !== session.userId) {
      return NextResponse.json(
        { error: "Forbidden. You are not authorized to update this post." },
        { status: 403 }
      );
    }

    // 5. Perform the update
    const updatedPost = await prisma.post.update({
      where: { id },
      data: updateData,
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
        message: "Post updated successfully.",
        post: updatedPost,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("PUT /api/posts/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update post." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/posts/[id]
 * Deletes an existing post. Only the authenticated author of the post can delete it.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string" || !isValidUuid(id)) {
      return NextResponse.json(
        { error: "Invalid post ID format. A valid UUID is required." },
        { status: 400 }
      );
    }

    // 1. Verify authenticated session
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json(
        { error: "Unauthorized. You must be signed in to delete a post." },
        { status: 401 }
      );
    }

    // 2. Check post existence and ownership
    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        authorId: true,
      },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: "Post not found." },
        { status: 404 }
      );
    }

    // 3. Strict authorization check: only the author can delete
    if (existingPost.authorId !== session.userId) {
      return NextResponse.json(
        { error: "Forbidden. You are not authorized to delete this post." },
        { status: 403 }
      );
    }

    // 4. Delete the post
    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Post deleted successfully." },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("DELETE /api/posts/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete post." },
      { status: 500 }
    );
  }
}
