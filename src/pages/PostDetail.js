import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api, formatApiError, resolveMediaUrl } from "../lib/api";
import { AdSlot, PostCard } from "../components/Cards";
import { toast } from "sonner";
import { formatCategoryLabel } from "../lib/categories";
import { PostDetailSkeleton } from "../components/SiteSkeletons";

export default function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [reactions, setReactions] = useState({ like: 0, love: 0, insightful: 0 });

  useEffect(() => {
    let mounted = true;

    setPost(null);
    setComments([]);
    setCommentsLoading(true);
    setReactions({ like: 0, love: 0, insightful: 0 });
    window.scrollTo(0, 0);

    api.get(`/posts/${slug}`).then(({ data }) => {
      if (!mounted) return;
      setPost(data);
      setReactions(data?.reactions || { like: 0, love: 0, insightful: 0 });
    }).catch(() => {
      if (mounted) setPost(false);
    });

    api.get(`/posts/${slug}/comments`).then(({ data }) => {
      if (mounted) setComments(Array.isArray(data) ? data : []);
    }).catch(() => {
      if (mounted) setComments([]);
    }).finally(() => {
      if (mounted) setCommentsLoading(false);
    });

    return () => { mounted = false; };
  }, [slug]);

  const react = async (type) => {
    try {
      const { data } = await api.post(`/posts/${slug}/react`, { type });
      setReactions(data);
      toast.success("Reaction recorded.");
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  if (post === null) return <PostDetailSkeleton />;
  if (post === false) return <div className="max-w-3xl mx-auto px-6 py-32 text-center text-forest-500">Article not found.</div>;

  const parts = (post.content || "").split("</h2>");
  const halfIdx = Math.floor(parts.length / 2);
  const firstHalf = parts.slice(0, halfIdx).join("</h2>") + (halfIdx > 0 ? "</h2>" : "");
  const secondHalf = parts.slice(halfIdx).join("</h2>");
  const categoryLabel = formatCategoryLabel(post.category);

  return (
    <article data-testid="post-detail-page">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-4xl mx-auto px-6 lg:px-10 pt-16 pb-10 text-center"
      >
        <Link to={`/category/${post.category}`} className="eyebrow hover:text-terracotta-dark" data-testid="post-category-link">{categoryLabel}</Link>
        <h1 className="font-serif text-4xl md:text-6xl text-forest-900 leading-[1.05] mt-5">{post.title}</h1>
        <div className="mt-6 text-sm text-forest-500 flex justify-center gap-3 items-center">
          <span>{post.author}</span><span className="opacity-50">&middot;</span>
          <span>{post.read_time || 7} min read</span><span className="opacity-50">&middot;</span>
          <span>{post.views} views</span>
        </div>
      </motion.header>

      <div className="max-w-5xl mx-auto px-6 lg:px-10">
        <PostCoverImage src={post.cover_image} alt={post.title} />
      </div>

      <div className="max-w-3xl mx-auto px-6 lg:px-10 py-16">
        <div className="article-body" dangerouslySetInnerHTML={{ __html: firstHalf }} />
        <div className="my-12"><AdSlot category={post.category} label={`${categoryLabel} sponsored placement`} /></div>
        <div className="article-body" dangerouslySetInnerHTML={{ __html: secondHalf }} />

        <div className="mt-16 pt-10 border-t border-sand-300" data-testid="reactions-section">
          <div className="eyebrow mb-4">Tell us how it landed</div>
          <div className="flex gap-3">
            <ReactionBtn type="like" count={reactions.like} label="Useful" onClick={() => react("like")} />
            <ReactionBtn type="love" count={reactions.love} label="Loved it" onClick={() => react("love")} />
            <ReactionBtn type="insightful" count={reactions.insightful} label="Insightful" onClick={() => react("insightful")} />
          </div>
        </div>

        <CommentsSection slug={slug} comments={comments} setComments={setComments} commentsLoading={commentsLoading} />
      </div>

      {post.related && post.related.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16 border-t border-sand-300" data-testid="related-section">
          <div className="eyebrow mb-3">Continue reading</div>
          <h3 className="font-serif text-3xl md:text-4xl text-forest-900 mb-8">More from {categoryLabel}</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {post.related.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        </section>
      )}
    </article>
  );
}

function PostCoverImage({ src, alt }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div className="w-full h-[380px] md:h-[560px] bg-gradient-to-br from-sand-100 to-sand-300 flex items-center justify-center" aria-hidden="true">
        <span className="text-xs uppercase tracking-[0.35em] text-forest-500">No Cover</span>
      </div>
    );
  }

  return (
    <img
      src={resolveMediaUrl(src)}
      alt={alt}
      onError={() => setFailed(true)}
      className="w-full h-[380px] md:h-[560px] object-cover"
    />
  );
}

function ReactionBtn({ type, count, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-3 border border-sand-300 hover:border-sage hover:text-sage transition-colors text-sm flex items-center gap-2"
      data-testid={`react-${type}`}
    >
      <span>{label}</span>
      <span className="text-xs text-forest-500">{count}</span>
    </button>
  );
}

function CommentsSection({ slug, comments, setComments, commentsLoading }) {
  const [form, setForm] = useState({ name: "", email: "", content: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post(`/posts/${slug}/comments`, form);
      setComments([data, ...comments]);
      setForm({ name: "", email: "", content: "" });
      toast.success("Comment posted. Thank you for reading.");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-16 pt-10 border-t border-sand-300" data-testid="comments-section">
      <div className="eyebrow mb-4">The Conversation</div>
      <h3 className="font-serif text-3xl text-forest-900 mb-6">{comments.length} thoughts</h3>

      <form onSubmit={submit} className="space-y-4 bg-white border border-sand-300 p-6" data-testid="comment-form">
        <div className="grid md:grid-cols-2 gap-3">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your name" className="bg-sand-50 border border-sand-300 px-3 py-3 focus:outline-none focus:border-sage" data-testid="comment-name" />
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Your email (not published)" className="bg-sand-50 border border-sand-300 px-3 py-3 focus:outline-none focus:border-sage" data-testid="comment-email" />
        </div>
        <textarea required rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
          placeholder="Add to the conversation..." className="w-full bg-sand-50 border border-sand-300 px-3 py-3 focus:outline-none focus:border-sage" data-testid="comment-content" />
        <button disabled={busy} className="btn-primary" data-testid="comment-submit">{busy ? "Sending..." : "Post comment"}</button>
      </form>

      <div className="mt-10 space-y-6">
        {commentsLoading ? (
          <>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="border-l-2 border-sand-200 pl-5">
                <div className="h-4 w-32 animate-pulse rounded bg-sand-200" />
                <div className="mt-3 h-4 w-full animate-pulse rounded bg-sand-100" />
                <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-sand-100" />
              </div>
            ))}
          </>
        ) : comments.map((c) => (
          <div key={c.id} className="border-l-2 border-sage pl-5" data-testid={`comment-${c.id}`}>
            <div className="text-sm text-forest-700 font-medium">{c.name}</div>
            <div className="text-forest-700 leading-relaxed mt-2">{c.content}</div>
          </div>
        ))}
        {!commentsLoading && comments.length === 0 && <div className="text-forest-500 text-sm">Be the first to share a thought.</div>}
      </div>
    </section>
  );
}
