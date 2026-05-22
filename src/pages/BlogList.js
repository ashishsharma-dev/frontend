import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import { PostCard, AdSlot } from "../components/Cards";
import { formatCategoryLabel, formatCategoryMeta } from "../lib/categories";
import { BlogListSkeleton } from "../components/SiteSkeletons";

export default function BlogList() {
  const params = useParams();
  const category = params.slug;
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadPosts() {
      setLoading(true);

      const q = new URLSearchParams();
      if (category) q.set("category", category);
      if (search) q.set("search", search);
      q.set("limit", "30");

      try {
        const { data } = await api.get(`/posts?${q.toString()}`);
        if (!mounted) return;
        setPosts(data?.items || []);
      } catch (_) {
        if (mounted) setPosts([]);
      }

      if (category) {
        try {
          const { data } = await api.get("/categories");
          if (!mounted) return;
          const match = Array.isArray(data) ? data.find((c) => c.slug === category) || null : null;
          setMeta(match ? formatCategoryMeta(match) : null);
        } catch (_) {
          if (mounted) setMeta(null);
        }
      } else if (mounted) {
        setMeta(null);
      }

      if (mounted) setLoading(false);
      if (mounted) setInitialLoad(false);
    }

    loadPosts();
    return () => { mounted = false; };
  }, [category, search]);

  const heading = category ? meta?.name || formatCategoryLabel(category) : "All Articles";
  const tagline = category ? meta?.tagline : "Every essay, slowly published.";

  if (loading && initialLoad) {
    return <BlogListSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16" data-testid="blog-list-page">
      <div className="eyebrow mb-4">{category ? "Section" : "Library"}</div>
      <h1 className="font-serif text-5xl md:text-6xl text-forest-900 mb-3 capitalize">{heading}</h1>
      <p className="text-forest-500 text-lg max-w-2xl">{tagline}</p>

      <div className="mt-10 mb-8 flex">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search articles..."
          className="w-full md:max-w-md bg-white border border-sand-300 px-4 py-3 focus:outline-none focus:border-sage"
          data-testid="blog-search-input"
        />
      </div>

      {loading && !initialLoad && (
        <div className="mb-6 text-sm text-forest-500" data-testid="blog-search-loading">
          Searching articles...
        </div>
      )}

      <div className="my-8"><AdSlot category={category} label={`${heading} sponsored placement`} /></div>

      {posts.length === 0 ? (
        <div className="text-forest-500 text-center py-20">No articles found.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}

      <div className="my-12"><AdSlot category={category} label={`${heading} sponsored placement`} /></div>
    </div>
  );
}
