import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api, resolveMediaUrl } from "../lib/api";
import { PostCard, AdSlot } from "../components/Cards";
import ThreeBackground from "../components/ThreeBackground";
import { formatCategoryLabel, formatCategoryMeta } from "../lib/categories";
import { HomeSkeleton } from "../components/SiteSkeletons";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadHome() {
      setLoading(true);
      const [postsRes, categoriesRes] = await Promise.allSettled([
        api.get("/posts?limit=13"),
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
  const recent = posts.slice(4, 13);

  return (
    <div data-testid="home-page">
      <ThreeBackground />

      <section className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-16 md:pt-24 pb-16">
        <div className="noise" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <div className="eyebrow mb-5">Calm editorial</div>
          <h1 className="font-serif text-5xl md:text-7xl text-forest-900 leading-[1.05] tracking-tight">
            Trends worth slowing down for - across travel, tech, finance, lifestyle, sports, and markets.
          </h1>
          <p className="mt-7 text-lg md:text-xl text-forest-500 max-w-2xl leading-relaxed">
            Long-form essays, slow journalism, and considered recommendations - published for readers who&apos;d rather think than scroll.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/blog" className="btn-primary" data-testid="hero-read-articles">Read the latest</Link>
            <Link to="/about" className="btn-ghost" data-testid="hero-about">Our editorial vision</Link>
          </div>
        </motion.div>
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
            <h2 className="font-serif text-4xl md:text-5xl text-forest-900">Six rooms in one quiet house.</h2>
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

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await api.post("/newsletter", { email });
          setEmail("");
          setMessage("Successfully subscribed! Welcome aboard.");
        } catch (_) {
          setMessage("");
        }
      }}
      className="mt-8 max-w-xl mx-auto space-y-3"
      data-testid="home-newsletter-form"
    >
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@quiet.email"
          className="flex-1 bg-white border border-sand-300 px-4 py-3 focus:outline-none focus:border-sage"
          data-testid="newsletter-email"
        />
        <button className="btn-primary" data-testid="newsletter-submit" type="submit">
          Join the list
        </button>
      </div>
      {message && <p className="text-sm text-sage">{message}</p>}
    </form>
  );
}
