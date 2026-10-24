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
  console.log("=== BLOGSPACE SEARCH & PAGINATION TEST SUITE ===\n");

  // 1. Default GET /api/posts
  console.log("Test 1: Default GET /api/posts");
  {
    const res = await fetch(`${BASE_URL}/api/posts`);
    assert(res.status === 200, "Status is 200");
    const data = await res.json();
    assert(Array.isArray(data.posts), "data.posts is an array");
    assert(data.pagination !== undefined, "data.pagination is present");
    assert(data.pagination.page === 1, "Default page is 1");
    assert(data.pagination.limit === 10, "Default limit is 10");
    assert(data.pagination.totalCount >= 8, `totalCount is at least 8 (got ${data.pagination.totalCount})`);
  }

  // 2. Pagination Page 1 with limit=6
  console.log("\nTest 2: Pagination Page 1 with limit=6");
  let firstPageIds = [];
  let firstPageTotalPages = 1;
  {
    const res = await fetch(`${BASE_URL}/api/posts?page=1&limit=6`);
    assert(res.status === 200, "Status is 200");
    const data = await res.json();
    assert(data.posts.length === 6, `Returned exactly 6 posts on page 1 (got ${data.posts.length})`);
    assert(data.pagination.page === 1, "pagination.page is 1");
    assert(data.pagination.limit === 6, "pagination.limit is 6");
    assert(data.pagination.totalPages >= 2, `pagination.totalPages is at least 2 (got ${data.pagination.totalPages})`);
    assert(data.pagination.hasMore === true, "hasMore is true for page 1");
    firstPageIds = data.posts.map(p => p.id);
    firstPageTotalPages = data.pagination.totalPages;
  }

  // 3. Pagination Last Page with limit=6
  console.log("\nTest 3: Pagination Last Page with limit=6");
  {
    const totalPages = firstPageTotalPages;
    const res = await fetch(`${BASE_URL}/api/posts?page=${totalPages}&limit=6`);
    assert(res.status === 200, "Status is 200");
    const data = await res.json();
    assert(data.posts.length >= 1, `Returned posts on last page (got ${data.posts.length})`);
    assert(data.pagination.page === totalPages, `pagination.page is ${totalPages}`);
    assert(data.pagination.hasMore === false, "hasMore is false on last page");
    // Verify no overlap between page 1 and last page
    const lastPageIds = data.posts.map(p => p.id);
    const overlap = lastPageIds.filter(id => firstPageIds.includes(id));
    assert(overlap.length === 0, "No duplicate posts between page 1 and last page");
  }

  // 4. Deterministic compound ordering (createdAt desc, id desc)
  console.log("\nTest 4: Deterministic compound ordering");
  {
    const res = await fetch(`${BASE_URL}/api/posts?limit=10`);
    const data = await res.json();
    let isOrdered = true;
    for (let i = 1; i < data.posts.length; i++) {
      const prev = new Date(data.posts[i - 1].createdAt).getTime();
      const curr = new Date(data.posts[i].createdAt).getTime();
      if (prev < curr) {
        isOrdered = false;
        break;
      }
    }
    assert(isOrdered, "Posts are ordered deterministically by newest first");
  }

  // 5. Search by title keyword
  console.log("\nTest 5: Search by title keyword ('Quantum')");
  {
    const res = await fetch(`${BASE_URL}/api/posts?search=Quantum`);
    assert(res.status === 200, "Status is 200");
    const data = await res.json();
    assert(data.posts.length >= 1, `Found ${data.posts.length} post(s)`);
    assert(
      data.posts.some(p => p.title.toLowerCase().includes("quantum")),
      "Results contain article with 'Quantum' in title"
    );
  }

  // 6. Search by content keyword ('Kubernetes' exists in content of Microservices post)
  console.log("\nTest 6: Search by content keyword ('Kubernetes')");
  {
    const res = await fetch(`${BASE_URL}/api/posts?search=Kubernetes`);
    assert(res.status === 200, "Status is 200");
    const data = await res.json();
    assert(data.posts.length >= 1, `Found ${data.posts.length} post(s) with 'Kubernetes' in content`);
    assert(
      data.posts.some(p => p.content.toLowerCase().includes("kubernetes")),
      "Post content actually contains 'Kubernetes'"
    );
  }

  // 7. Case-insensitive search ('quantum' vs 'QUANTUM')
  console.log("\nTest 7: Case-insensitive search ('quantum' vs 'QUANTUM')");
  {
    const resLower = await fetch(`${BASE_URL}/api/posts?search=quantum`);
    const dataLower = await resLower.json();
    const resUpper = await fetch(`${BASE_URL}/api/posts?search=QUANTUM`);
    const dataUpper = await resUpper.json();
    assert(dataLower.posts.length === dataUpper.posts.length, `Matches count identical (${dataLower.posts.length} vs ${dataUpper.posts.length})`);
    assert(dataLower.posts.length >= 1, "Both found matching posts");
  }

  // 8. Search query whitespace trimming
  console.log("\nTest 8: Search query whitespace trimming ('   CSS   ')");
  {
    const res = await fetch(`${BASE_URL}/api/posts?search=%20%20%20CSS%20%20%20`);
    assert(res.status === 200, "Status is 200");
    const data = await res.json();
    assert(data.posts.length >= 1, `Found ${data.posts.length} post(s) for padded query`);
    assert(data.posts.some(p => p.title.includes("CSS")), "Found CSS post successfully");
  }

  // 9. Search with 0 matches
  console.log("\nTest 9: Search with 0 matches ('NonExistentTermXYZ123')");
  {
    const res = await fetch(`${BASE_URL}/api/posts?search=NonExistentTermXYZ123`);
    assert(res.status === 200, "Status is 200");
    const data = await res.json();
    assert(data.posts.length === 0, "Returned 0 posts");
    assert(data.pagination.totalCount === 0, "totalCount is 0");
    assert(data.pagination.totalPages === 1, "totalPages is 1");
    assert(data.pagination.hasMore === false, "hasMore is false");
  }

  // 10. Search + Pagination combined
  console.log("\nTest 10: Search + Pagination combined");
  {
    const res = await fetch(`${BASE_URL}/api/posts?search=Engineering&page=1&limit=1`);
    assert(res.status === 200, "Status is 200");
    const data = await res.json();
    assert(data.posts.length === 1, "Returned 1 post per page");
    assert(data.pagination.limit === 1, "limit is 1");
    assert(data.pagination.totalCount >= 2, `totalCount >= 2 (got ${data.pagination.totalCount})`);
    assert(data.pagination.totalPages >= 2, `totalPages >= 2 (got ${data.pagination.totalPages})`);
    assert(data.pagination.hasMore === true, "hasMore is true on page 1");
  }

  // 11. authorId filter preservation
  console.log("\nTest 11: authorId filter preservation");
  {
    // Fetch a known author
    const allRes = await fetch(`${BASE_URL}/api/posts?limit=1`);
    const allData = await allRes.json();
    const testAuthorId = allData.posts[0].author.id;
    
    const authorRes = await fetch(`${BASE_URL}/api/posts?authorId=${testAuthorId}`);
    assert(authorRes.status === 200, "Status is 200");
    const authorData = await authorRes.json();
    assert(authorData.posts.length >= 1, "Returned author's posts");
    assert(
      authorData.posts.every(p => p.author.id === testAuthorId),
      "All returned posts belong strictly to specified authorId"
    );
  }

  // 12. Invalid query parameter validation
  console.log("\nTest 12: Invalid query parameter validation");
  {
    const resPage0 = await fetch(`${BASE_URL}/api/posts?page=0`);
    assert(resPage0.status === 400, "page=0 returns 400 Bad Request");

    const resPageNegative = await fetch(`${BASE_URL}/api/posts?page=-5`);
    assert(resPageNegative.status === 400, "page=-5 returns 400 Bad Request");

    const resPageString = await fetch(`${BASE_URL}/api/posts?page=abc`);
    assert(resPageString.status === 400, "page=abc returns 400 Bad Request");

    const resLimit0 = await fetch(`${BASE_URL}/api/posts?limit=0`);
    assert(resLimit0.status === 400, "limit=0 returns 400 Bad Request");

    const resLimitNegative = await fetch(`${BASE_URL}/api/posts?limit=-10`);
    assert(resLimitNegative.status === 400, "limit=-10 returns 400 Bad Request");

    const resLimitOver50 = await fetch(`${BASE_URL}/api/posts?limit=51`);
    assert(resLimitOver50.status === 400, "limit=51 (>50) returns 400 Bad Request");

    const resLimitString = await fetch(`${BASE_URL}/api/posts?limit=xyz`);
    assert(resLimitString.status === 400, "limit=xyz returns 400 Bad Request");
  }

  // 13. Page out of bounds handling
  console.log("\nTest 13: Page out of bounds handling (e.g. page=999)");
  {
    const res = await fetch(`${BASE_URL}/api/posts?page=999&limit=10`);
    assert(res.status === 200, "Status is 200 (no crash)");
    const data = await res.json();
    assert(Array.isArray(data.posts) && data.posts.length === 0, "Returns empty posts array");
    assert(data.pagination.page === 999, "page is 999");
    assert(data.pagination.hasMore === false, "hasMore is false");
  }

  // 14. Authentication and CRUD safety checks
  console.log("\nTest 14: Authentication and CRUD safety checks");
  {
    const unauthPostRes = await fetch(`${BASE_URL}/api/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Hack Post", content: "Should be rejected without auth" }),
    });
    assert(unauthPostRes.status === 401, "POST /api/posts rejected with 401 Unauthorized");

    const unauthPutRes = await fetch(`${BASE_URL}/api/posts/00000000-0000-0000-0000-000000000000`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Updated" }),
    });
    assert(unauthPutRes.status === 401, "PUT /api/posts/[id] rejected with 401 Unauthorized");

    const unauthDelRes = await fetch(`${BASE_URL}/api/posts/00000000-0000-0000-0000-000000000000`, {
      method: "DELETE",
    });
    assert(unauthDelRes.status === 401, "DELETE /api/posts/[id] rejected with 401 Unauthorized");
  }

  console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
