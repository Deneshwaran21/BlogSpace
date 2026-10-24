"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BlogFormData, FormErrors, WRITER_ROLES } from "@/types/blog";
import { mockCategories } from "@/data/mockBlogs";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Button from "../ui/Button";
import {
  FileText,
  Image as ImageIcon,
  Clock,
  Tag,
  Eye,
  CheckCircle,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  Trash2,
  UserCheck,
} from "lucide-react";

interface BlogFormProps {
  initialData?: Partial<BlogFormData>;
  isEditing?: boolean;
  postId?: string;
}

export function BlogForm({
  initialData,
  isEditing = false,
  postId,
}: BlogFormProps) {
  const router = useRouter();

  // Extract author role and category if embedded in content
  const rawInitialContent = initialData?.content || "";
  const roleMatch = rawInitialContent.match(/<!--\s*author_role:\s*([^>]+?)\s*-->/i);
  const categoryMatch = rawInitialContent.match(/<!--\s*category:\s*([^>]+?)\s*-->/i);

  const initialRole = roleMatch ? roleMatch[1].trim() : (initialData?.authorRole || "Software Engineer");
  const initialCategory = categoryMatch ? categoryMatch[1].trim() : (initialData?.category || "Technology");

  const initialCleanContent = rawInitialContent
    .replace(/<!--\s*author_role:\s*([^>]+?)\s*-->\r?\n?/gi, "")
    .replace(/<!--\s*category:\s*([^>]+?)\s*-->\r?\n?/gi, "")
    .trim();

  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string } | null>(null);

  const [formData, setFormData] = useState<BlogFormData>({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    excerpt: initialData?.excerpt || "",
    content: initialCleanContent,
    category: initialCategory,
    authorRole: initialRole,
    coverImage:
      initialData?.coverImage ||
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80",
    tags: initialData?.tags || "Design, Engineering, Next.js",
    readingTime: initialData?.readingTime || "5 min read",
  });

  // Check current session to identify writer
  React.useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { credentials: "same-origin" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.user) {
          setCurrentUser(data.user);
          if (!isEditing && data.user.name?.toLowerCase().includes("deneshwaran")) {
            setFormData((prev) => ({
              ...prev,
              authorRole: "Software Engineer",
            }));
          }
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isEditing]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [previewTab, setPreviewTab] = useState<"write" | "preview">("write");
  const [submissionStatus, setSubmissionStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: !isEditing ? generateSlug(title) : prev.slug,
    }));
    if (errors.title) {
      setErrors((prev) => ({ ...prev, title: undefined }));
    }
    if (serverError) setServerError(null);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Article title is required.";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Title should be at least 3 characters long.";
    } else if (formData.title.trim().length > 200) {
      newErrors.title = "Title cannot exceed 200 characters.";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Article content cannot be empty.";
    } else if (formData.content.trim().length < 10) {
      newErrors.content = "Content should be at least 10 characters long.";
    } else if (formData.content.trim().length > 100000) {
      newErrors.content = "Content exceeds maximum limit of 100,000 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmissionStatus("idle");
      window.scrollTo({ top: 150, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);
    setSubmissionStatus("loading");
    setServerError(null);

    try {
      const selectedRole = formData.authorRole || "Software Engineer";
      const selectedCategory = formData.category || "Technology";
      const cleanProse = formData.content.trim();
      const contentWithMetadata = `<!-- category: ${selectedCategory} -->\n<!-- author_role: ${selectedRole} -->\n\n${cleanProse}`;

      // Send only fields supported by the backend REST API
      const payload = {
        title: formData.title.trim(),
        content: contentWithMetadata,
      };

      const url = isEditing && postId ? `/api/posts/${postId}` : "/api/posts";
      const method = isEditing && postId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setIsSubmitting(false);
        setSubmissionStatus("error");

        if (res.status === 401) {
          setServerError("Unauthorized: You must be signed in to perform this action.");
        } else if (res.status === 403) {
          setServerError("Forbidden: You are not authorized to update this story. Only the original author can edit it.");
        } else if (res.status === 404) {
          setServerError("Story not found.");
        } else {
          setServerError(data.error || "Failed to save story. Please review the form.");
        }

        window.scrollTo({ top: 150, behavior: "smooth" });
        return;
      }

      setSubmissionStatus("success");
      const targetId = data.post?.id || postId;

      setTimeout(() => {
        if (targetId) {
          router.push(`/blog/${targetId}`);
        } else {
          router.push("/");
        }
        router.refresh();
      }, 600);
    } catch {
      setIsSubmitting(false);
      setSubmissionStatus("error");
      setServerError("Network error: Could not reach the server. Please try again.");
      window.scrollTo({ top: 150, behavior: "smooth" });
    }
  };

  const handleDelete = async () => {
    if (!postId) return;

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this story? This action cannot be undone."
    );
    if (!confirmed) return;

    setIsDeleting(true);
    setServerError(null);

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        credentials: "same-origin",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setIsDeleting(false);
        setSubmissionStatus("error");

        if (res.status === 401) {
          setServerError("Unauthorized: You must be signed in to delete this story.");
        } else if (res.status === 403) {
          setServerError("Forbidden: You are not authorized to delete this story. Only the author can delete it.");
        } else if (res.status === 404) {
          setServerError("Story not found.");
        } else {
          setServerError(data.error || "Failed to delete story.");
        }

        window.scrollTo({ top: 150, behavior: "smooth" });
        return;
      }

      // Success: redirect to home
      router.push("/");
      router.refresh();
    } catch {
      setIsDeleting(false);
      setSubmissionStatus("error");
      setServerError("Network error: Could not reach the server. Please try again.");
      window.scrollTo({ top: 150, behavior: "smooth" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Link */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to all stories
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-[#E8E4DA] pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100/60 px-2.5 py-1 rounded-full">
          {isEditing ? "Story Editor" : "New Story Draft"}
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 mt-3">
          {isEditing ? `Edit Story: ${formData.title || "Untitled"}` : "Craft a New Perspective"}
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          {isEditing
            ? "Update the article metadata, editorial prose, and cover artwork below."
            : "Share thoughtful research, architectural guides, or design insights with the BlogSpace community."}
        </p>
      </div>

      {/* Server Error Banner */}
      {serverError && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start gap-3.5 text-rose-900 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Action Failed</h4>
            <p className="text-xs text-rose-800 leading-relaxed">
              {serverError}
            </p>
            {serverError.includes("signed in") && (
              <div className="pt-2">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-rose-900 underline hover:text-rose-950"
                >
                  Go to Sign In &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success Banner */}
      {submissionStatus === "success" && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-3.5 text-emerald-900 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">
              {isEditing ? "Story updated successfully!" : "Story published successfully!"}
            </h4>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Redirecting to your article...
            </p>
          </div>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Author Verification Banner for Deneshwaran M */}
        {currentUser?.name?.toLowerCase().includes("deneshwaran") && (
          <div className="bg-amber-50/90 border border-amber-200 rounded-3xl p-5 flex items-center gap-4 text-amber-950 shadow-2xs animate-in fade-in">
            <img
              src="/authors/deneshwaran.jpg"
              alt="Deneshwaran M"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-400 shrink-0 shadow-xs"
            />
            <div className="space-y-0.5 text-left">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-slate-900">
                  {currentUser.name}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-300/60">
                  Software Engineer
                </span>
              </div>
              <p className="text-xs text-amber-900/80 leading-relaxed">
                Your verified executive portrait and Software Engineer badge are automatically bound to this article dispatch.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E8E4DA] shadow-xs space-y-6">
          {/* Title */}
          <Input
            id="blog-title"
            label="Story Title"
            placeholder="e.g. The Architecture of Editorial Elegance"
            value={formData.title}
            onChange={handleTitleChange}
            errorMessage={errors.title}
            required
            helperText="Aim for clarity and emotional resonance."
          />

          {/* Slug, Category & Writer Role */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              id="blog-slug"
              label="URL Slug"
              placeholder="e.g. editorial-elegance-guide"
              value={formData.slug}
              onChange={(e) => {
                setFormData({ ...formData, slug: e.target.value });
                if (errors.slug) setErrors({ ...errors, slug: undefined });
              }}
              errorMessage={errors.slug}
              required
              helperText="URL: /blog/[slug]"
            />

            <div className="space-y-1.5 text-left">
              <label
                htmlFor="blog-category"
                className="block text-sm font-medium text-slate-800"
              >
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                id="blog-category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#D8D4CA] bg-white text-slate-900 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/10 cursor-pointer"
              >
                {mockCategories
                  .filter((cat) => cat !== "All")
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
              </select>
              <p className="text-xs text-slate-500">
                Discoverability topic.
              </p>
            </div>

            <div className="space-y-1.5 text-left">
              <label
                htmlFor="blog-author-role"
                className="block text-sm font-medium text-slate-800"
              >
                Writer Role <span className="text-rose-500">*</span>
              </label>
              <select
                id="blog-author-role"
                value={formData.authorRole || "Software Engineer"}
                onChange={(e) =>
                  setFormData({ ...formData, authorRole: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#D8D4CA] bg-white text-slate-900 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/10 cursor-pointer font-medium"
              >
                {WRITER_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500">
                Writer craft identity (Software Engineer, Designer, etc.).
              </p>
            </div>
          </div>

          {/* Excerpt */}
          <Textarea
            id="blog-excerpt"
            label="Short Excerpt"
            placeholder="A compelling 1-2 sentence preview to engage readers on the homepage..."
            rows={2}
            value={formData.excerpt}
            onChange={(e) => {
              setFormData({ ...formData, excerpt: e.target.value });
              if (errors.excerpt) setErrors({ ...errors, excerpt: undefined });
            }}
            errorMessage={errors.excerpt}
            charCount={{ current: formData.excerpt.length, max: 200 }}
            required
            helperText="Displays in cards and search engine snippets."
          />

          {/* Cover Image & Estimated Read Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Input
                id="blog-cover-image"
                label="Cover Image URL"
                placeholder="https://images.unsplash.com/..."
                value={formData.coverImage}
                onChange={(e) => {
                  setFormData({ ...formData, coverImage: e.target.value });
                  if (errors.coverImage)
                    setErrors({ ...errors, coverImage: undefined });
                }}
                leftIcon={<ImageIcon className="w-4 h-4" />}
                errorMessage={errors.coverImage}
                required
              />
            </div>
            <div>
              <Input
                id="blog-reading-time"
                label="Reading Time"
                placeholder="e.g. 6 min read"
                value={formData.readingTime}
                onChange={(e) =>
                  setFormData({ ...formData, readingTime: e.target.value })
                }
                leftIcon={<Clock className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Image Preview Thumbnail */}
          {formData.coverImage && (
            <div className="rounded-xl overflow-hidden border border-[#E8E4DA] bg-slate-50 p-2">
              <p className="text-xs text-slate-500 font-medium mb-1.5 px-1">
                Cover Image Preview
              </p>
              <div className="relative h-44 w-full rounded-lg overflow-hidden bg-slate-200">
                <img
                  src={formData.coverImage}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback on image error
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80";
                  }}
                />
              </div>
            </div>
          )}

          {/* Tags */}
          <Input
            id="blog-tags"
            label="Tags (Comma separated)"
            placeholder="TypeScript, Architecture, Design, Nextjs"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            leftIcon={<Tag className="w-4 h-4" />}
            helperText="Separate tags with commas."
          />

          {/* Story Content with Write / Preview Tabs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="blog-content"
                className="block text-sm font-medium text-slate-800"
              >
                Article Content (Markdown supported){" "}
                <span className="text-rose-500">*</span>
              </label>

              {/* Tabs */}
              <div className="flex items-center rounded-lg bg-[#EFECE4] p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewTab("write")}
                  className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    previewTab === "write"
                      ? "bg-white text-slate-900 shadow-2xs font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("preview")}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    previewTab === "preview"
                      ? "bg-white text-slate-900 shadow-2xs font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </button>
              </div>
            </div>

            {previewTab === "write" ? (
              <Textarea
                id="blog-content"
                rows={12}
                placeholder="Write your article body here in Markdown or plain prose..."
                value={formData.content}
                onChange={(e) => {
                  setFormData({ ...formData, content: e.target.value });
                  if (errors.content)
                    setErrors({ ...errors, content: undefined });
                }}
                errorMessage={errors.content}
                charCount={{ current: formData.content.length }}
                required
              />
            ) : (
              <div className="min-h-[300px] p-6 rounded-xl border border-[#E8E4DA] bg-[#FBFBFA] space-y-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Rendered Preview
                </p>
                <div className="prose prose-slate max-w-none font-serif text-slate-800 leading-relaxed space-y-4 whitespace-pre-wrap">
                  {formData.content || (
                    <span className="text-slate-400 italic">
                      Nothing written yet. Switch to &apos;Write&apos; tab to compose your story.
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-4">
          <Button href="/" variant="ghost" size="md" disabled={isSubmitting || isDeleting}>
            Cancel
          </Button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isEditing && postId && (
              <Button
                type="button"
                variant="danger"
                size="md"
                onClick={handleDelete}
                isLoading={isDeleting}
                disabled={isSubmitting || isDeleting}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Delete Story
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="md"
              disabled={isSubmitting || isDeleting}
              onClick={() => {
                alert("Story saved to local browser draft memory!");
              }}
            >
              Save Draft
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              disabled={isSubmitting || isDeleting}
              rightIcon={!isSubmitting ? <Sparkles className="w-4 h-4" /> : undefined}
            >
              {isEditing ? "Update Story" : "Publish Story"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default BlogForm;
