import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import { PostCard, AdSlot } from "../components/Cards";
import { formatCategoryLabel, formatCategoryMeta } from "../lib/categories";
import { BlogListSkeleton } from "../components/SiteSkeletons";

const POSTS_PER_PAGE = 12;

export default function BlogList() {
  const params = useParams();
  const routeCategory = params.slug || "";
  const isCategoryPage = Boolean(routeCategory);
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(routeCategory || "all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [meta, setMeta] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    setSelectedCategory(routeCategory || "all");
    setPage(1);
  }, [routeCategory]);

  useEffect(() => {
    setPage(1);
  }, [search, selectedCategory]);

  useEffect(() => {
    let mounted = true;

    async function loadPosts() {
      setLoading(true);

      const effectiveCategory = isCategoryPage ? routeCategory : selectedCategory !== "all" ? selectedCategory : "";
      const q = new URLSearchParams();
      if (effectiveCategory) q.set("category", effectiveCategory);
      if (search.trim()) q.set("search", search.trim());
      q.set("limit", String(POSTS_PER_PAGE));
      q.set("skip", String((page - 1) * POSTS_PER_PAGE));

      try {
        const { data } = await api.get(`/posts?${q.toString()}`);
        if (!mounted) return;
        setPosts(data?.items || []);
        setTotal(data?.total || 0);
      } catch (_) {
        if (mounted) {
          setPosts([]);
          setTotal(0);
        }
      }

      if (mounted) {
        setLoading(false);
        setInitialLoad(false);
      }
    }

    loadPosts();
    return () => { mounted = false; };
  }, [isCategoryPage, page, routeCategory, search, selectedCategory]);

  useEffect(() => {
    let mounted = true;

    async function loadCategories() {
      try {
        const { data } = await api.get("/categories");
        if (!mounted) return;
        const items = Array.isArray(data) ? data.map((category) => formatCategoryMeta(category)) : [];
        setCategories(items);
        if (routeCategory) {
          const match = items.find((item) => item.slug === routeCategory) || null;
          setMeta(match);
        } else {
          setMeta(null);
        }
      } catch (_) {
        if (mounted) {
          setCategories([]);
          setMeta(null);
        }
      }
    }

    loadCategories();
    return () => { mounted = false; };
  }, [routeCategory]);

  const heading = routeCategory ? meta?.name || formatCategoryLabel(routeCategory) : "All Articles";
  const tagline = routeCategory ? meta?.tagline : "Every essay, slowly published.";
  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
  const pageStart = total === 0 ? 0 : (page - 1) * POSTS_PER_PAGE + 1;
  const pageEnd = Math.min(page * POSTS_PER_PAGE, total);

  if (loading && initialLoad) {
    return <BlogListSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16" data-testid="blog-list-page">
      <div className="eyebrow mb-4">{routeCategory ? "Section" : "Library"}</div>
      <h1 className="font-serif text-5xl md:text-6xl text-forest-900 mb-3 capitalize">{heading}</h1>
      <p className="text-forest-500 text-lg max-w-2xl">{tagline}</p>

      <div className="mt-10 mb-8 bg-white border border-sand-300 p-4 space-y-4" data-testid="blog-filters">
        <div className="grid md:grid-cols-[minmax(0,1fr)_220px] gap-3">
          <div>
            <label className="eyebrow block mb-1">Search Articles</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or excerpt"
              className="w-full bg-sand-50 border border-sand-300 px-4 py-3 focus:outline-none focus:border-sage"
              data-testid="blog-search-input"
            />
          </div>

          {!isCategoryPage && (
            <div>
              <label className="eyebrow block mb-1">Category Filter</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-sand-50 border border-sand-300 px-4 py-3 focus:outline-none focus:border-sage"
                data-testid="blog-category-filter"
              >
                <option value="all">All categories</option>
                {categories.map((item) => (
                  <option key={item.slug} value={item.slug}>{item.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {!isCategoryPage && categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <FilterChip active={selectedCategory === "all"} onClick={() => setSelectedCategory("all")}>
              All
            </FilterChip>
            {categories.map((item) => (
              <FilterChip
                key={item.slug}
                active={selectedCategory === item.slug}
                onClick={() => setSelectedCategory(item.slug)}
              >
                {item.name}
              </FilterChip>
            ))}
          </div>
        )}

        <div className="text-sm text-forest-500">
          {total === 0 ? "No matching articles." : `Showing ${pageStart}-${pageEnd} of ${total} articles`}
        </div>
      </div>

      {loading && !initialLoad && (
        <div className="mb-6 text-sm text-forest-500" data-testid="blog-search-loading">
          Loading articles...
        </div>
      )}

      <div className="my-8"><AdSlot category={routeCategory} label={`${heading} sponsored placement`} /></div>

      {posts.length === 0 ? (
        <div className="text-forest-500 text-center py-20">No articles found.</div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <div className="my-12"><AdSlot category={routeCategory} label={`${heading} sponsored placement`} /></div>
    </div>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-xs border transition-colors ${
        active
          ? "border-forest-900 bg-forest-900 text-white"
          : "border-sand-300 bg-white text-forest-700 hover:border-sage hover:text-sage"
      }`}
    >
      {children}
    </button>
  );
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let current = 1; current <= totalPages; current += 1) {
    pages.push(current);
  }

  return (
    <div className="pt-8" data-testid="blog-pagination">
      <div className="flex flex-wrap items-center gap-2 border-t border-sand-300 pt-6">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="btn-ghost text-xs py-2 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {pages.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={`min-w-10 px-3 py-2 text-xs border transition-colors ${
              item === page
                ? "border-forest-900 bg-forest-900 text-white"
                : "border-sand-300 bg-white text-forest-700 hover:border-sage hover:text-sage"
            }`}
          >
            {item}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="btn-ghost text-xs py-2 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
