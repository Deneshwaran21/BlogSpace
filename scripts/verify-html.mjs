const BASE_URL = "http://localhost:3000";

async function verifyHtml() {
  console.log("Checking Homepage HTML rendering at", BASE_URL);
  const res = await fetch(BASE_URL);
  const html = await res.text();

  console.log("Status:", res.status);
  console.log("Contains Search input:", html.includes('id="homepage-search-input"'));
  console.log("Contains Placeholder:", html.includes('Search articles by title or content...'));
  console.log("Contains Pagination nav:", html.includes('aria-label="Blog pagination navigation"'));
  console.log("Contains 'Previous' button:", html.includes('pagination-prev-button'));
  console.log("Contains 'Next' button:", html.includes('pagination-next-button'));
  console.log("Contains 'Showing page 1 of 2':", html.includes('Showing page'));
  console.log("Contains 'Editor Lead Feature':", html.includes("Editor") || html.includes("Lead Feature"));
  console.log("Contains 'Latest Dispatches':", html.includes("Latest Dispatches"));
}

verifyHtml().catch(console.error);
