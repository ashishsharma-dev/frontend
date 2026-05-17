import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api, formatApiError } from "../lib/api";
import { toast } from "sonner";

const EMPTY = {
  title: "", excerpt: "", content: "", category: "travel", author: "Editorial Team",
  cover_image: "", tags: [], published: true,
};

const CATEGORY_ORDER = [
  { slug: "travel", name: "Travel", color: "#839788" },
  { slug: "tech", name: "Tech", color: "#5C6B6D" },
  { slug: "finance", name: "Finance", color: "#C6A28A" },
  { slug: "products", name: "Products", color: "#9C8B7A" },
  { slug: "sports", name: "Sports", color: "#6E8B7E" },
  { slug: "trading", name: "Trading", color: "#A48A6E" },
];

function AdminPostRow({ p, onEdit, onRemove }) {
  return (
    <div className="bg-white border border-sand-300 p-4 flex items-center gap-4 hover:border-sage/50 transition-colors" data-testid={`admin-post-row-${p.id}`}>
      <img src={p.cover_image} alt="" className="w-16 h-16 md:w-20 md:h-20 object-cover hidden sm:block bg-sand-200" />
      <div className="flex-1 min-w-0">
        <div className="eyebrow text-[0.65rem] capitalize">{p.category} · {p.published ? "Published" : "Draft"}</div>
        <div className="font-serif text-base md:text-lg text-forest-900 truncate leading-tight">{p.title}</div>
        <div className="text-xs text-forest-500 mt-0.5">{p.views || 0} views · {p.author}</div>
      </div>
      <button onClick={() => onEdit(p)} className="btn-ghost text-xs py-1.5 px-3" data-testid={`edit-${p.id}`}>Edit</button>
      <button onClick={() => onRemove(p.id)} className="text-xs text-red-600 hover:underline" data-testid={`delete-${p.id}`}>Delete</button>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [tagInput, setTagInput] = useState("");
  const [groupByCategory, setGroupByCategory] = useState(true);

  useEffect(() => {
    if (user && user.role === "admin") {
      load();
    }
  }, [user]);

  if (user === null) return <div className="text-center py-32 text-forest-500">Loading…</div>;
  if (!user || user.role !== "admin") return <Navigate to="/admin/login" replace />;

  async function load() {
    try {
      const [s, p] = await Promise.all([api.get("/admin/stats"), api.get("/admin/posts")]);
      setStats(s.data);
      setPosts(p.data);
    } catch (e) { toast.error(formatApiError(e)); }
  }

  async function save(e) {
    e.preventDefault();
    try {
      const payload = { ...form, tags: form.tags };
      if (editing) {
        await api.put(`/admin/posts/${editing}`, payload);
        toast.success("Post updated.");
      } else {
        await api.post("/admin/posts", payload);
        toast.success("Post published.");
      }
      setForm(EMPTY); setEditing(null); setTagInput(""); load();
    } catch (err) { toast.error(formatApiError(err)); }
  }

  async function remove(id) {
    if (!window.confirm("Delete this post permanently?")) return;
    try { await api.delete(`/admin/posts/${id}`); toast.success("Deleted."); load(); }
    catch (e) { toast.error(formatApiError(e)); }
  }

  function edit(p) {
    setEditing(p.id);
    setForm({ ...EMPTY, ...p });
    setTagInput((p.tags || []).join(", "));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12" data-testid="admin-dashboard">
      <div className="eyebrow mb-3">Editorial Desk</div>
      <h1 className="font-serif text-5xl text-forest-900 mb-8">Dashboard</h1>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12" data-testid="admin-stats">
          <Stat label="Posts" value={stats.total_posts} testid="stat-posts" />
          <Stat label="Published" value={stats.published} testid="stat-published" />
          <Stat label="Comments" value={stats.total_comments} testid="stat-comments" />
          <Stat label="Subscribers" value={stats.subscribers} testid="stat-subscribers" />
          <Stat label="Views" value={stats.total_views} testid="stat-views" />
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-8">
        <form onSubmit={save} className="lg:col-span-5 bg-white border border-sand-300 p-6 sticky top-24 self-start" data-testid="admin-post-form">
          <div className="eyebrow mb-2">{editing ? "Edit Post" : "New Post"}</div>
          <h2 className="font-serif text-2xl text-forest-900 mb-5">{editing ? "Update an essay" : "Publish an essay"}</h2>
          <div className="space-y-3">
            <Input label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} testid="form-title" />
            <InputOpt label="Cover image URL (optional)" value={form.cover_image} onChange={(v) => setForm({ ...form, cover_image: v })} testid="form-cover" />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} testid="form-category"
                options={["travel","tech","finance","products","sports","trading"]} />
              <Input label="Author" value={form.author} onChange={(v) => setForm({ ...form, author: v })} testid="form-author" />
            </div>
            <Input label="Tags (comma separated)" value={tagInput} onChange={(v) => { setTagInput(v); setForm({ ...form, tags: v.split(",").map(t => t.trim()).filter(Boolean) }); }} testid="form-tags" />
            <Textarea label="Excerpt" value={form.excerpt} onChange={(v) => setForm({ ...form, excerpt: v })} rows={3} testid="form-excerpt" />
            <Textarea label="Content (HTML allowed)" value={form.content} onChange={(v) => setForm({ ...form, content: v })} rows={10} testid="form-content" />
            <label className="flex items-center gap-2 text-sm text-forest-700">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} data-testid="form-published" />
              Published
            </label>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1" data-testid="post-save">{editing ? "Update" : "Publish"}</button>
              {editing && <button type="button" onClick={() => { setEditing(null); setForm(EMPTY); setTagInput(""); }} className="btn-ghost" data-testid="form-cancel">Cancel</button>}
            </div>
          </div>
        </form>

        <div className="lg:col-span-7" data-testid="admin-posts-list">
          <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
            <h2 className="font-serif text-2xl text-forest-900">All Posts ({posts.length})</h2>
            <div className="flex items-center gap-2 text-xs">
              <span className="eyebrow mr-1">View</span>
              <button
                type="button"
                onClick={() => setGroupByCategory(false)}
                className={`px-3 py-1.5 border ${!groupByCategory ? "border-forest-900 text-forest-900" : "border-sand-300 text-forest-500 hover:border-sage hover:text-sage"}`}
                data-testid="view-flat"
              >Flat list</button>
              <button
                type="button"
                onClick={() => setGroupByCategory(true)}
                className={`px-3 py-1.5 border ${groupByCategory ? "border-forest-900 text-forest-900" : "border-sand-300 text-forest-500 hover:border-sage hover:text-sage"}`}
                data-testid="view-by-category"
              >By category</button>
            </div>
          </div>

          {!groupByCategory ? (
            <div className="space-y-3">
              {posts.map(p => <AdminPostRow key={p.id} p={p} onEdit={edit} onRemove={remove} />)}
            </div>
          ) : (
            <div className="space-y-10" data-testid="admin-posts-grouped">
              {CATEGORY_ORDER.map(cat => {
                const items = posts.filter(p => p.category === cat.slug);
                return (
                  <section key={cat.slug} data-testid={`admin-category-${cat.slug}`}>
                    <div className="flex items-baseline justify-between mb-4 pb-2 border-b border-sand-300">
                      <div>
                        <div className="eyebrow" style={{ color: cat.color }}>{cat.name}</div>
                        <div className="text-xs text-forest-500 mt-1">{items.length} post{items.length === 1 ? "" : "s"} · {items.filter(i => i.published).length} published</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setForm({ ...EMPTY, category: cat.slug }); setEditing(null); setTagInput(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        className="text-xs text-sage hover:text-forest-900 transition-colors"
                        data-testid={`new-in-${cat.slug}`}
                      >+ New post in {cat.name}</button>
                    </div>
                    <div className="space-y-3">
                      {items.length === 0 ? (
                        <div className="text-xs text-forest-500 italic py-3 pl-1">No posts in this category yet.</div>
                      ) : (
                        items.map(p => <AdminPostRow key={p.id} p={p} onEdit={edit} onRemove={remove} />)
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, testid }) {
  const id = testid || `stat-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="bg-white border border-sand-300 p-5" data-testid={id}>
      <div className="eyebrow">{label}</div>
      <div className="font-serif text-3xl text-forest-900 mt-2">{value}</div>
    </div>
  );
}
function Input({ label, value, onChange, testid }) {
  return (
    <div>
      <label className="eyebrow block mb-1">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} required
        className="w-full bg-sand-50 border border-sand-300 px-3 py-2 focus:outline-none focus:border-sage text-sm"
        data-testid={testid} />
    </div>
  );
}
function InputOpt({ label, value, onChange, testid }) {
  return (
    <div>
      <label className="eyebrow block mb-1">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-sand-50 border border-sand-300 px-3 py-2 focus:outline-none focus:border-sage text-sm"
        data-testid={testid} />
    </div>
  );
}
function Textarea({ label, value, onChange, rows = 4, testid }) {
  return (
    <div>
      <label className="eyebrow block mb-1">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} required rows={rows}
        className="w-full bg-sand-50 border border-sand-300 px-3 py-2 focus:outline-none focus:border-sage text-sm font-mono"
        data-testid={testid} />
    </div>
  );
}
function Select({ label, value, onChange, options, testid }) {
  return (
    <div>
      <label className="eyebrow block mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-sand-50 border border-sand-300 px-3 py-2 focus:outline-none focus:border-sage text-sm capitalize"
        data-testid={testid}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
