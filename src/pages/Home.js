import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api, formatApiError, resolveMediaUrl } from "../lib/api";
import { PostCard, AdSlot } from "../components/Cards";
import ThreeBackground from "../components/ThreeBackground";
import { formatCategoryLabel, formatCategoryMeta } from "../lib/categories";
import { HomeSkeleton } from "../components/SiteSkeletons";
import { toast } from "sonner";

const HERO_RAIL_COUNT = 4;

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadHome() {
      setLoading(true);
      const [postsRes, categoriesRes] = await Promise.allSettled([
        api.get("/posts?limit=16"),
        api.get("/categories"),
      ]);

      if (!mounted) return;

      setPosts(postsRes.status === "fulfilled" ? postsRes.value.data?.items || [] : []);
      setCategories(
        categoriesRes.status === "fulfilled" && Array.isArray(categoriesRes.value.data)
          ? categoriesRes.value.data.map((category) => formatCategoryMeta(category))
          : [],
      );
      setLoading(false);
    }

    loadHome();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div data-testid="home-page">
        <ThreeBackground />
        <HomeSkeleton />
      </div>
    );
  }

  const hero = posts[0];
  const featured = posts.slice(1, 4);
  const railPosts = posts.slice(1, 1 + HERO_RAIL_COUNT);
  const recent = posts.slice(4, 16);

  return (
    <div data-testid="home-page">
      <ThreeBackground />

      <section className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-16 md:pt-24 pb-16">
        <div className="noise" />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <div className="eyebrow mb-5">Calm editorial</div>
            <h1 className="font-serif text-5xl md:text-7xl text-forest-900 leading-[1.05] tracking-tight">
              The best things you'll read this week won't go viral.
            </h1>
            <p className="mt-7 text-lg md:text-xl text-forest-500 max-w-2xl leading-relaxed">
             And that's exactly why we write them. Deep, considered, unhurried journalism across travel & adventure, technology, finance, e-commerce, sports, and trading & investment.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/blog" className="btn-primary" data-testid="hero-read-articles">Read the latest</Link>
            </div>
          </motion.div>

          {railPosts.length > 0 && (
            <motion.aside
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.08 }}
              className="editorial-card p-6 lg:p-7 bg-white/90 backdrop-blur-sm"
              data-testid="home-hero-rail"
            >
              <div className="eyebrow mb-4">Latest articles</div>
              <div className="space-y-4">
                {railPosts.map((post, index) => (
                  <Link
                    key={post.id}
                    to={`/post/${post.slug}`}
                    className="block border-b border-sand-200 pb-4 last:border-b-0 last:pb-0 group"
                  >
                    <div className="text-[0.68rem] uppercase tracking-[0.24em] text-forest-500">
                      {String(index + 1).padStart(2, "0")} · {formatCategoryLabel(post.category)}
                    </div>
                    <h2 className="mt-2 font-serif text-2xl text-forest-900 leading-tight transition-colors group-hover:text-terracotta-dark">
                      {post.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-forest-500 line-clamp-2">
                      {post.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            </motion.aside>
          )}
        </div>
      </section>

      {hero && (
        <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-12" data-testid="hero-post-section">
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
            <Link to={`/post/${hero.slug}`} className="lg:col-span-8 group flex flex-col overflow-hidden bg-white border border-sand-300 hover:border-sage/40 transition-all duration-300 hover:-translate-y-1">
              <div className="overflow-hidden aspect-[16/10] bg-sand-200">
                <HeroCoverImage src={hero.cover_image} alt={hero.title} />
              </div>
              <div className="p-8 md:p-10 flex flex-col flex-1">
                <div className="eyebrow mb-4 capitalize">{formatCategoryLabel(hero.category)} &middot; Featured</div>
                <h2 className="font-serif text-3xl md:text-5xl text-forest-900 leading-[1.1] group-hover:text-terracotta-dark transition-colors line-clamp-3">
                  {hero.title}
                </h2>
                <p className="text-forest-500 mt-4 leading-relaxed text-base md:text-lg line-clamp-3">{hero.excerpt}</p>
                <div className="mt-auto pt-6 text-xs text-forest-500 flex gap-3 items-center">
                  <span>{hero.author}</span><span className="opacity-50">&middot;</span><span>{hero.read_time || 7} min read</span>
                </div>
              </div>
            </Link>
            <div className="lg:col-span-4 grid grid-cols-1 gap-6 lg:gap-8">
              {featured.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-6 lg:px-10 my-10">
        <AdSlot label="Featured sponsored placement" />
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-12" data-testid="category-grid">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="eyebrow mb-3">Sections</div>
            <h2 className="font-serif text-4xl md:text-5xl text-forest-900">Explore curated insights across every interest.</h2>
          </div>
          <Link to="/blog" className="hidden md:block text-sm text-sage hover:text-forest-900">Browse all -&gt;</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 lg:gap-6">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to={`/category/${c.slug}`}
              className="editorial-card p-7 group flex flex-col h-full min-h-[180px]"
              data-testid={`category-card-${c.slug}`}
            >
              <div className="eyebrow" style={{ color: c.color }}>{c.name}</div>
              <div className="font-serif text-2xl text-forest-900 mt-3 group-hover:text-terracotta-dark transition-colors leading-snug">{c.tagline}</div>
              <div className="text-sm text-forest-500 mt-auto pt-4">{c.count} Blogs</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
        <div className="eyebrow mb-3">The Latest</div>
        <h2 className="font-serif text-4xl md:text-5xl text-forest-900 mb-10">Fresh from the desk.</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {recent.slice(0, 6).map((p) => <PostCard key={p.id} post={p} />)}
        </div>
        <div className="my-12"><AdSlot label="Latest sponsored placement" /></div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {recent.slice(6).map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 lg:px-10 py-20 text-center" data-testid="home-newsletter">
        <div className="eyebrow mb-4">News Letter</div>
        <h2 className="font-serif text-4xl md:text-5xl text-forest-900 leading-tight">One thoughtful email each Sunday.</h2>
        <p className="mt-5 text-forest-500 text-lg">No clickbait. No tracking pixels. Just our best long read of the week.</p>
        <NewsletterForm />
      </section>
    </div>
  );
}

function HeroCoverImage({ src, alt }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-sand-100 to-sand-300 flex items-center justify-center" aria-hidden="true">
        <span className="text-[0.7rem] uppercase tracking-[0.3em] text-forest-500">No Cover</span>
      </div>
    );
  }

  return (
    <img
      src={resolveMediaUrl(src)}
      alt={alt}
      onError={() => setFailed(true)}
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
    />
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setMessage("");
        setErrorMessage("");
        setBusy(true);
        try {
          const { data } = await api.post("/newsletter", { email });
          setEmail("");
          setMessage(data?.message || "Successfully subscribed! Welcome aboard.");
          toast.success(data?.message || "Successfully subscribed! Welcome aboard.");
        } catch (err) {
          setMessage("");
          setErrorMessage(formatApiError(err));
        } finally {
          setBusy(false);
        }
      }}
      className="mt-8 max-w-xl mx-auto space-y-3"
      data-testid="home-newsletter-form"
      >
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          required
          disabled={busy}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@quiet.email"
          className="flex-1 bg-white border border-sand-300 px-4 py-3 focus:outline-none focus:border-sage"
          data-testid="newsletter-email"
        />
        <button className="btn-primary" data-testid="newsletter-submit" type="submit" disabled={busy}>
          {busy ? "Joining..." : "Join the list"}
        </button>
      </div>
      {message && <p className="text-sm text-sage">{message}</p>}
      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
    </form>
  );
}
