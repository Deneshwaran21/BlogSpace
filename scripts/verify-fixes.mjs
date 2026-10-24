const BASE_URL = "http://localhost:3000";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log("=== VERIFYING FIXES FOR ALL 3 ISSUES ===\n");

  // ==========================================
  // ISSUE 1: Category Saving & Adaptation
  // ==========================================
  console.log("--- Testing Issue 1: Category Saving & Adaptation ---");
  {
    // 1.1 Register & Login a test user to create a Design blog
    const testEmail = `category_tester_${Date.now()}@example.com`;
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Design Architect",
        email: testEmail,
        password: "Password123!",
      }),
    });
    assert(regRes.status === 201, "Registered category tester user");

    // Login
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: "Password123!" }),
    });
    assert(loginRes.status === 200, "Logged in category tester");
    const cookie = loginRes.headers.get("set-cookie");
    assert(!!cookie, "Captured session cookie");

    // 1.2 Create a post with Category: "Design"
    const createRes = await fetch(`${BASE_URL}/api/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({
        title: "Spatial Typography and Tactile Layouts",
        content: `<!-- category: Design -->\n<!-- author_role: Designer -->\n\nExploring modern spatial design principles, tactile elevation tokens, and typographic hierarchy in digital environments.`,
      }),
    });
    assert(createRes.status === 201, "Created blog with Category: Design");
    const createData = await createRes.json();
    const createdPostId = createData.post?.id;
    assert(!!createdPostId, `Post created with ID: ${createdPostId}`);

    // 1.3 Verify it adapts as "Design", NOT "Technology"
    const getCreatedRes = await fetch(`${BASE_URL}/api/posts/${createdPostId}`);
    assert(getCreatedRes.status === 200, "Fetched created post by ID");
    const getCreatedData = await getCreatedRes.json();
    assert(getCreatedData.post.content.includes("category: Design"), "Content retains 'category: Design'");

    // Check with postAdapter
    const { adaptDbPostToBlogPost } = await import("../src/lib/postAdapter.ts");
    const adapted = adaptDbPostToBlogPost(getCreatedData.post);
    assert(adapted.category === "Design", `Adapted category is 'Design' (got '${adapted.category}')`);
    assert(adapted.tags.includes("Design"), "Tags contain 'Design'");
  }

  // ==========================================
  // ISSUE 2: Search for "design", "quantum", "ai"
  // ==========================================
  console.log("\n--- Testing Issue 2: Search & Category Discoverability ---");
  {
    // 2.1 Search "design" (common page)
    const searchDesignRes = await fetch(`${BASE_URL}/api/posts?search=design`);
    assert(searchDesignRes.status === 200, "Search 'design' status 200");
    const designData = await searchDesignRes.json();
    assert(designData.posts.length >= 2, `Found ${designData.posts.length} posts for 'design' (>= 2)`);
    const designTitles = designData.posts.map(p => p.title.toLowerCase());
    assert(
      designTitles.some(t => t.includes("design")),
      "Results contain posts with 'design' in title or content"
    );

    // 2.2 Search "quantum"
    const searchQuantumRes = await fetch(`${BASE_URL}/api/posts?search=quantum`);
    assert(searchQuantumRes.status === 200, "Search 'quantum' status 200");
    const quantumData = await searchQuantumRes.json();
    assert(quantumData.posts.length >= 1, `Found ${quantumData.posts.length} post(s) for 'quantum' (>= 1)`);
    assert(
      quantumData.posts.some(p => p.title.toLowerCase().includes("quantum")),
      "Results contain Quantum Computing article"
    );

    // 2.3 Search "ai"
    const searchAiRes = await fetch(`${BASE_URL}/api/posts?search=ai`);
    assert(searchAiRes.status === 200, "Search 'ai' status 200");
    const aiData = await searchAiRes.json();
    assert(aiData.posts.length >= 2, `Found ${aiData.posts.length} post(s) for 'ai' (>= 2)`);
    assert(
      aiData.posts.some(p => p.title.toLowerCase().includes("ai")),
      "Results contain AI articles (India's AI Revolution / AI-Assisted Engineering)"
    );

    // 2.4 Category query filter for "Design"
    const catDesignRes = await fetch(`${BASE_URL}/api/posts?category=Design`);
    assert(catDesignRes.status === 200, "GET /api/posts?category=Design status 200");
    const catDesignData = await catDesignRes.json();
    assert(catDesignData.posts.length >= 2, `Found ${catDesignData.posts.length} posts with category 'Design'`);

    // 2.5 Category query filter for "Artificial Intelligence"
    const catAiRes = await fetch(`${BASE_URL}/api/posts?category=Artificial%20Intelligence`);
    assert(catAiRes.status === 200, "GET /api/posts?category=Artificial Intelligence status 200");
    const catAiData = await catAiRes.json();
    assert(catAiData.posts.length >= 2, `Found ${catAiData.posts.length} posts with category 'Artificial Intelligence'`);
  }

  // ==========================================
  // ISSUE 3: Signed-in vs Common Page
  // ==========================================
  console.log("\n--- Testing Issue 3: Signed-in vs Common Page Listing ---");
  {
    // 3.1 Common Page (WITHOUT SIGNIN): every blog should be listed
    const commonRes = await fetch(`${BASE_URL}/api/posts?limit=50`);
    assert(commonRes.status === 200, "Common page GET /api/posts status 200");
    const commonData = await commonRes.json();
    const commonAuthors = new Set(commonData.posts.map(p => p.author.name));
    assert(commonAuthors.size >= 2, `Common page has posts from multiple authors (${commonAuthors.size} authors)`);
    assert(commonData.posts.length >= 8, `Common page lists every blog (${commonData.posts.length} total posts)`);

    // 3.2 SIGNED IN: only my blog should be shown
    // Login as Deneshwaran M (denesh@gmail.com)
    // Note: Deneshwaran was created in prior tests or seed; let's log in or test with a dedicated user
    const authorEmail = `my_blogs_user_${Date.now()}@example.com`;
    await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Dedicated Author",
        email: authorEmail,
        password: "Password123!",
      }),
    });

    const authorLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: authorEmail, password: "Password123!" }),
    });
    const authorCookie = authorLogin.headers.get("set-cookie");

    // Before creating any posts, a signed-in user with 0 posts should see 0 posts
    const emptyRes = await fetch(`${BASE_URL}/api/posts`, {
      headers: { Cookie: authorCookie },
    });
    const emptyData = await emptyRes.json();
    assert(emptyData.posts.length === 0, `Signed-in user with no posts sees 0 posts (got ${emptyData.posts.length})`);

    // Create 2 posts for this author
    await fetch(`${BASE_URL}/api/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: authorCookie },
      body: JSON.stringify({
        title: "Dedicated Author First Story",
        content: "<!-- category: Technology -->\n\nContent for the first story by dedicated author.",
      }),
    });
    await fetch(`${BASE_URL}/api/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: authorCookie },
      body: JSON.stringify({
        title: "Dedicated Author Second Story",
        content: "<!-- category: Design -->\n\nContent for the second story by dedicated author.",
      }),
    });

    // When signed in: ONLY my blog should be shown!
    const myBlogsRes = await fetch(`${BASE_URL}/api/posts`, {
      headers: { Cookie: authorCookie },
    });
    assert(myBlogsRes.status === 200, "Signed-in GET /api/posts status 200");
    const myBlogsData = await myBlogsRes.json();
    assert(myBlogsData.posts.length === 2, `Signed-in user sees exactly their 2 posts (got ${myBlogsData.posts.length})`);
    assert(
      myBlogsData.posts.every(p => p.author.email === authorEmail),
      "All posts shown to signed-in user belong STRICTLY to that user"
    );

    // 3.3 After Logout / on Common page: every blog is shown again
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: authorCookie },
    });
    assert(logoutRes.status === 200, "Logged out successfully");

    const backToCommonRes = await fetch(`${BASE_URL}/api/posts?limit=50`);
    const backToCommonData = await backToCommonRes.json();
    assert(
      backToCommonData.posts.length > 2,
      `Common page lists all blogs from every author (${backToCommonData.posts.length} posts)`
    );
  }

  console.log(`\n=== ALL FIXES VERIFIED: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
