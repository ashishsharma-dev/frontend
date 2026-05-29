import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api, formatApiError, resolveMediaUrl } from "../lib/api";
import { toast } from "sonner";
import { formatCategoryLabel } from "../lib/categories";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

const EMPTY_POST = {
  title: "",
  excerpt: "",
  content: "",
  category: "travel-adventure",
  author: "Editorial Team",
  cover_image: "",
  tags: [],
  published: true,
};

const EMPTY_AD = {
  category: "travel-adventure",
  image_url: "",
  hyperlink: "",
  status: "active",
};

const CATEGORY_ORDER = [
  { slug: "travel-adventure", color: "#839788" },
  { slug: "technology", color: "#5C6B6D" },
  { slug: "finance", color: "#C6A28A" },
  { slug: "ecommerce", color: "#9C8B7A" },
  { slug: "sports", color: "#6E8B7E" },
  { slug: "trading-investment", color: "#A48A6E" },
];
const POSTS_PER_PAGE = 12;

function AdminPostRow({ p, onEdit, onRemove }) {
  return (
    <div className="bg-white border border-sand-300 p-4 flex items-center gap-4 hover:border-sage/50 transition-colors" data-testid={`admin-post-row-${p.id}`}>
      <CoverPlaceholderOrImage src={p.cover_image} alt="" className="w-16 h-16 md:w-20 md:h-20 hidden sm:block" />
      <div className="flex-1 min-w-0">
        <div className="eyebrow text-[0.65rem] capitalize">{formatCategoryLabel(p.category)} &middot; {p.published ? "Published" : "Draft"}</div>
        <div className="font-serif text-base md:text-lg text-forest-900 truncate leading-tight">{p.title}</div>
        <div className="text-xs text-forest-500 mt-0.5">{p.views || 0} views &middot; {p.author}</div>
      </div>
      <button onClick={() => onEdit(p)} className="btn-ghost text-xs py-1.5 px-3" data-testid={`edit-${p.id}`}>Edit</button>
      <button onClick={() => onRemove(p.id)} className="text-xs text-red-600 hover:underline" data-testid={`delete-${p.id}`}>Delete</button>
    </div>
  );
}

function AdminAdRow({ ad, onEdit, onToggle, onRemove }) {
  const isActive = ad.status === "active";
  return (
    <div className="bg-white border border-sand-300 p-4 hover:border-sage/50 transition-colors" data-testid={`admin-ad-row-${ad.id}`}>
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <img src={resolveMediaUrl(ad.image_url)} alt="" className="w-full max-w-[320px] lg:max-w-[240px] h-auto border border-sand-300 bg-sand-100" />
        <div className="flex-1 min-w-0">
          <div className="eyebrow capitalize">{formatCategoryLabel(ad.category)} &middot; {isActive ? "Active" : "Paused"}</div>
          <div className="text-sm text-forest-700 break-all mt-2">{ad.hyperlink}</div>
          <div className="text-xs text-forest-500 mt-2">Creative size: 728 x 90 px</div>
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          <button onClick={() => onEdit(ad)} className="btn-ghost text-xs py-1.5 px-3">Edit</button>
          <button onClick={() => onToggle(ad)} className="btn-ghost text-xs py-1.5 px-3">
            {isActive ? "Pause" : "Enable"}
          </button>
          <button onClick={() => onRemove(ad.id)} className="text-xs text-red-600 hover:underline">Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [ads, setAds] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_POST);
  const [tagInput, setTagInput] = useState("");
  const [groupByCategory, setGroupByCategory] = useState(false);
  const [postSearch, setPostSearch] = useState("");
  const [postCategoryFilter, setPostCategoryFilter] = useState("all");
  const [postPage, setPostPage] = useState(1);
  const [coverFileName, setCoverFileName] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);

  const [adEditing, setAdEditing] = useState(null);
  const [adForm, setAdForm] = useState(EMPTY_AD);
  const [adFileName, setAdFileName] = useState("");
  const [uploadingAd, setUploadingAd] = useState(false);

  useEffect(() => {
    if (user && user.role === "admin") {
      load();
    }
  }, [user]);

  useEffect(() => {
    setPostPage(1);
  }, [postSearch, postCategoryFilter, groupByCategory]);

  if (user === null) return <div className="text-center py-32 text-forest-500">Loading...</div>;
  if (!user || user.role !== "admin") return <Navigate to="/admin/login" replace />;

  async function load() {
    try {
      const [s, p, a] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/posts"),
        api.get("/admin/ads"),
      ]);
      setStats(s.data);
      setPosts(p.data);
      setAds(a.data);
      setPostPage(1);
    } catch (e) {
      toast.error(formatApiError(e));
    }
  }

  async function savePost(e) {
    e.preventDefault();

    if (!form.title.trim() || !form.excerpt.trim() || !stripHtml(form.content).trim()) {
      toast.error("Title, excerpt, and content are required.");
      return;
    }

    try {
      const payload = { ...form, tags: form.tags };
      if (editing) {
        await api.put(`/admin/posts/${editing}`, payload);
        toast.success("Post updated.");
      } else {
        await api.post("/admin/posts", payload);
        toast.success("Post published.");
      }
      setForm(EMPTY_POST);
      setEditing(null);
      setTagInput("");
      setCoverFileName("");
      load();
    } catch (err) {
      toast.error(formatApiError(err));
    }
  }

  async function removePost(id) {
    if (!window.confirm("Delete this post permanently?")) return;
    try {
      await api.delete(`/admin/posts/${id}`);
      toast.success("Deleted.");
      load();
    } catch (e) {
      toast.error(formatApiError(e));
    }
  }

  function editPost(p) {
    setEditing(p.id);
    setForm({ ...EMPTY_POST, ...p });
    setTagInput((p.tags || []).join(", "));
    setCoverFileName("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadPostCover(file) {
    if (!file) return;

    const payload = new FormData();
    payload.append("file", file);

    try {
      setUploadingCover(true);
      const { data } = await api.post("/admin/posts/upload-cover", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((current) => ({ ...current, cover_image: data.image_url }));
      setCoverFileName(file.name);
      toast.success("Cover image uploaded.");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setUploadingCover(false);
    }
  }

  async function validateLeaderboard(file) {
    const size = await new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        reject(new Error("Could not read image."));
        URL.revokeObjectURL(url);
      };
      img.src = url;
    });

    if (size.width !== 728 || size.height !== 90) {
      throw new Error("Creative must be exactly 728 x 90 pixels.");
    }
  }

  async function uploadAdCreative(file) {
    if (!file) return;

    const payload = new FormData();

    try {
      await validateLeaderboard(file);
      payload.append("file", file);
      setUploadingAd(true);
      const { data } = await api.post("/admin/ads/upload", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAdForm((current) => ({ ...current, image_url: data.image_url }));
      setAdFileName(file.name);
      toast.success("Creative uploaded.");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setUploadingAd(false);
    }
  }

  async function saveAd(e) {
    e.preventDefault();

    if (!adForm.image_url) {
      toast.error("Upload a 728 x 90 creative before saving.");
      return;
    }

    if (!adForm.hyperlink.trim()) {
      toast.error("Hyperlink is required.");
      return;
    }

    try {
      if (adEditing) {
        await api.put(`/admin/ads/${adEditing}`, adForm);
        toast.success("Advertisement updated.");
      } else {
        await api.post("/admin/ads", adForm);
        toast.success("Advertisement created.");
      }
      resetAdForm();
      load();
    } catch (err) {
      toast.error(formatApiError(err));
    }
  }

  function editAd(ad) {
    setAdEditing(ad.id);
    setAdForm({
      category: ad.category,
      image_url: ad.image_url,
      hyperlink: ad.hyperlink,
      status: ad.status,
    });
    setAdFileName("");
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  async function toggleAd(ad) {
    try {
      await api.put(`/admin/ads/${ad.id}`, { status: ad.status === "active" ? "paused" : "active" });
      toast.success(ad.status === "active" ? "Advertisement paused." : "Advertisement enabled.");
      load();
    } catch (err) {
      toast.error(formatApiError(err));
    }
  }

  async function removeAd(id) {
    if (!window.confirm("Delete this advertisement permanently?")) return;
    try {
      await api.delete(`/admin/ads/${id}`);
      toast.success("Advertisement deleted.");
      load();
    } catch (err) {
      toast.error(formatApiError(err));
    }
  }

  function resetAdForm() {
    setAdEditing(null);
    setAdForm(EMPTY_AD);
    setAdFileName("");
  }

  const normalizedPostSearch = postSearch.trim().toLowerCase();
  const filteredPosts = posts.filter((post) => {
    const matchesCategory = postCategoryFilter === "all" || post.category === postCategoryFilter;
    const matchesSearch = !normalizedPostSearch || [
      post.title,
      post.excerpt,
      post.author,
      formatCategoryLabel(post.category),
      ...(post.tags || []),
    ].some((value) => String(value || "").toLowerCase().includes(normalizedPostSearch));

    return matchesCategory && matchesSearch;
  });

  const totalPostPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const currentPostPage = Math.min(postPage, totalPostPages);
  const paginatedPosts = filteredPosts.slice((currentPostPage - 1) * POSTS_PER_PAGE, currentPostPage * POSTS_PER_PAGE);
  const pageStart = filteredPosts.length === 0 ? 0 : (currentPostPage - 1) * POSTS_PER_PAGE + 1;
  const pageEnd = Math.min(currentPostPage * POSTS_PER_PAGE, filteredPosts.length);
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12" data-testid="admin-dashboard">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="eyebrow mb-3">Editorial Desk</div>
          <h1 className="font-serif text-5xl text-forest-900">Dashboard</h1>
        </div>
        <button
          type="button"
          onClick={async () => {
            await logout();
            navigate("/");
          }}
          className="btn-ghost text-sm py-2 px-4"
        >
          Sign out
        </button>
      </div>

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
        <form onSubmit={savePost} className="lg:col-span-5 bg-white border border-sand-300 p-6 sticky top-24 self-start" data-testid="admin-post-form">
          <div className="eyebrow mb-2">{editing ? "Edit Post" : "New Post"}</div>
          <h2 className="font-serif text-2xl text-forest-900 mb-5">{editing ? "Update a blog post" : "Publish a blog post"}</h2>
          <div className="space-y-3">
            <Input label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} testid="form-title" />
            <div>
              <label className="eyebrow block mb-1">Choose Cover Image</label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    await uploadPostCover(file);
                  }
                  e.target.value = "";
                }}
                className="w-full bg-sand-50 border border-sand-300 px-3 py-2 text-sm file:mr-3 file:border-0 file:bg-forest-900 file:text-white file:px-3 file:py-2"
                data-testid="form-cover"
              />
              <div className="text-xs text-forest-500 mt-2">
                Upload PNG, JPG, GIF, or WebP. Files are stored on the server for long-term use.
              </div>
              {uploadingCover && <div className="text-xs text-sage mt-2">Uploading cover image...</div>}
              {coverFileName && <div className="text-xs text-forest-500 mt-2">Latest upload: {coverFileName}</div>}
              {form.cover_image && (
                <div className="mt-3">
                  <div className="eyebrow block mb-2">Preview</div>
                  <CoverPlaceholderOrImage
                    src={form.cover_image}
                    alt="Cover preview"
                    className="w-full h-44 border border-sand-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setForm((current) => ({ ...current, cover_image: "" }));
                      setCoverFileName("");
                    }}
                    className="text-xs text-red-600 hover:underline mt-2"
                  >
                    Remove cover image
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Category"
                value={form.category}
                onChange={(v) => setForm({ ...form, category: v })}
                testid="form-category"
                options={CATEGORY_ORDER.map((item) => item.slug)}
              />
              <Input label="Author" value={form.author} onChange={(v) => setForm({ ...form, author: v })} testid="form-author" />
            </div>
            <Input label="Tags (comma separated)" value={tagInput} onChange={(v) => { setTagInput(v); setForm({ ...form, tags: v.split(",").map((t) => t.trim()).filter(Boolean) }); }} testid="form-tags" />
            <Textarea label="Excerpt" value={form.excerpt} onChange={(v) => setForm({ ...form, excerpt: v })} rows={3} testid="form-excerpt" />
            <RichTextEditor label="Content" value={form.content} onChange={(v) => setForm({ ...form, content: v })} testid="form-content" />
            <label className="flex items-center gap-2 text-sm text-forest-700">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} data-testid="form-published" />
              Published
            </label>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1" data-testid="post-save">{editing ? "Update" : "Publish"}</button>
              {editing && <button type="button" onClick={() => { setEditing(null); setForm(EMPTY_POST); setTagInput(""); setCoverFileName(""); }} className="btn-ghost" data-testid="form-cancel">Cancel</button>}
            </div>
          </div>
        </form>

        <div className="lg:col-span-7" data-testid="admin-posts-list">
          <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
            <div>
              <h2 className="font-serif text-2xl text-forest-900">All Posts ({filteredPosts.length})</h2>
              {filteredPosts.length !== posts.length && (
                <div className="text-xs text-forest-500 mt-1">
                  Filtered from {posts.length} total posts
                </div>
              )}
              {!groupByCategory && filteredPosts.length > 0 && (
                <div className="text-xs text-forest-500 mt-1">
                  Showing {pageStart}-{pageEnd} of {filteredPosts.length} posts
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="eyebrow mr-1">View</span>
              <button
                type="button"
                onClick={() => {
                  setGroupByCategory(false);
                  setPostPage(1);
                }}
                className={`px-3 py-1.5 border ${!groupByCategory ? "border-forest-900 text-forest-900" : "border-sand-300 text-forest-500 hover:border-sage hover:text-sage"}`}
                data-testid="view-flat"
              >Flat list</button>
              <button
                type="button"
                onClick={() => {
                  setGroupByCategory(true);
                  setPostPage(1);
                }}
                className={`px-3 py-1.5 border ${groupByCategory ? "border-forest-900 text-forest-900" : "border-sand-300 text-forest-500 hover:border-sage hover:text-sage"}`}
                data-testid="view-by-category"
              >By category</button>
            </div>
          </div>

          <div className="mb-6 bg-white border border-sand-300 p-4 space-y-4" data-testid="admin-post-filters">
            <div className="grid md:grid-cols-[minmax(0,1fr)_220px] gap-3">
              <div>
                <label className="eyebrow block mb-1">Search Posts</label>
                <input
                  type="text"
                  value={postSearch}
                  onChange={(e) => setPostSearch(e.target.value)}
                  placeholder="Search by title, excerpt, author, or tag"
                  className="w-full bg-sand-50 border border-sand-300 px-3 py-2 focus:outline-none focus:border-sage text-sm"
                  data-testid="post-search"
                />
              </div>
              <div>
                <label className="eyebrow block mb-1">Category Filter</label>
                <select
                  value={postCategoryFilter}
                  onChange={(e) => setPostCategoryFilter(e.target.value)}
                  className="w-full bg-sand-50 border border-sand-300 px-3 py-2 focus:outline-none focus:border-sage text-sm"
                  data-testid="post-category-filter"
                >
                  <option value="all">All categories</option>
                  {CATEGORY_ORDER.map((item) => (
                    <option key={item.slug} value={item.slug}>{formatCategoryLabel(item.slug)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <FilterChip active={postCategoryFilter === "all"} onClick={() => setPostCategoryFilter("all")}>
                All
              </FilterChip>
              {CATEGORY_ORDER.map((item) => (
                <FilterChip
                  key={item.slug}
                  active={postCategoryFilter === item.slug}
                  onClick={() => setPostCategoryFilter(item.slug)}
                >
                  {formatCategoryLabel(item.slug)}
                </FilterChip>
              ))}
              {(postSearch || postCategoryFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setPostSearch("");
                    setPostCategoryFilter("all");
                  }}
                  className="text-xs text-red-600 hover:underline px-1"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {!groupByCategory ? (
            <div className="space-y-3">
              {paginatedPosts.map((p) => <AdminPostRow key={p.id} p={p} onEdit={editPost} onRemove={removePost} />)}
              {filteredPosts.length === 0 && (
                <div className="bg-white border border-sand-300 p-6 text-sm text-forest-500">No posts match your search or category filter.</div>
              )}
              {filteredPosts.length > POSTS_PER_PAGE && (
                <Pagination
                  page={currentPostPage}
                  totalPages={totalPostPages}
                  onChange={setPostPage}
                />
              )}
            </div>
          ) : (
            <div className="space-y-10" data-testid="admin-posts-grouped">
              {CATEGORY_ORDER.map((cat) => {
                const items = filteredPosts.filter((p) => p.category === cat.slug);
                const label = formatCategoryLabel(cat.slug);
                return (
                  <section key={cat.slug} data-testid={`admin-category-${cat.slug}`}>
                    <div className="flex items-baseline justify-between mb-4 pb-2 border-b border-sand-300">
                      <div>
                        <div className="eyebrow" style={{ color: cat.color }}>{label}</div>
                        <div className="text-xs text-forest-500 mt-1">{items.length} post{items.length === 1 ? "" : "s"} &middot; {items.filter((i) => i.published).length} published</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setForm({ ...EMPTY_POST, category: cat.slug }); setEditing(null); setTagInput(""); setCoverFileName(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        className="text-xs text-sage hover:text-forest-900 transition-colors"
                        data-testid={`new-in-${cat.slug}`}
                      >+ New post in {label}</button>
                    </div>
                    <div className="space-y-3">
                      {items.length === 0 ? (
                        <div className="text-xs text-forest-500 italic py-3 pl-1">No posts in this category yet.</div>
                      ) : (
                        items.map((p) => <AdminPostRow key={p.id} p={p} onEdit={editPost} onRemove={removePost} />)
                      )}
                    </div>
                  </section>
                );
              })}
              {filteredPosts.length === 0 && (
                <div className="bg-white border border-sand-300 p-6 text-sm text-forest-500">No posts match your search or category filter.</div>
              )}
            </div>
          )}
        </div>
      </div>

      <section className="mt-16 pt-10 border-t border-sand-300" data-testid="admin-ads-panel">
        <div className="mb-8">
          <div className="eyebrow mb-3">Advertisement Panel</div>
          <h2 className="font-serif text-4xl text-forest-900">Manage leaderboard creatives</h2>
          <p className="text-forest-500 mt-3 max-w-3xl">
            One 728 x 90 ad is served per category article. Paused ads automatically fall back to a dummy creative without any hyperlink.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h3 className="font-serif text-2xl text-forest-900">Advertisements ({ads.length})</h3>
              <div className="text-xs text-forest-500">728 x 90 px only</div>
            </div>
            {ads.length === 0 ? (
              <div className="bg-white border border-sand-300 p-6 text-sm text-forest-500">No advertisements added yet.</div>
            ) : (
              ads.map((ad) => <AdminAdRow key={ad.id} ad={ad} onEdit={editAd} onToggle={toggleAd} onRemove={removeAd} />)
            )}
          </div>

          <form onSubmit={saveAd} className="lg:col-span-5 bg-white border border-sand-300 p-6 self-start" data-testid="admin-ad-form">
            <div className="eyebrow mb-2">{adEditing ? "Edit Advertisement" : "New Advertisement"}</div>
            <h3 className="font-serif text-2xl text-forest-900 mb-5">{adEditing ? "Update leaderboard ad" : "Create leaderboard ad"}</h3>
            <div className="space-y-4">
              <Select
                label="Category"
                value={adForm.category}
                onChange={(v) => setAdForm({ ...adForm, category: v })}
                testid="ad-category"
                options={CATEGORY_ORDER.map((item) => item.slug)}
              />
              <Input label="Hyperlink" value={adForm.hyperlink} onChange={(v) => setAdForm({ ...adForm, hyperlink: v })} testid="ad-hyperlink" />
              <Select
                label="Status"
                value={adForm.status}
                onChange={(v) => setAdForm({ ...adForm, status: v })}
                testid="ad-status"
                options={["active", "paused"]}
              />
              <div>
                <label className="eyebrow block mb-1">Creative Upload</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      await uploadAdCreative(file);
                    }
                    e.target.value = "";
                  }}
                  className="w-full bg-sand-50 border border-sand-300 px-3 py-2 text-sm file:mr-3 file:border-0 file:bg-forest-900 file:text-white file:px-3 file:py-2"
                  data-testid="ad-creative-upload"
                />
                <div className="text-xs text-forest-500 mt-2">
                  Upload PNG, JPG, GIF, or WebP. Exact size required: 728 x 90 px. Uploads are stored permanently.
                </div>
                {uploadingAd && <div className="text-xs text-sage mt-2">Uploading creative...</div>}
                {adFileName && <div className="text-xs text-forest-500 mt-2">Latest upload: {adFileName}</div>}
              </div>

              {adForm.image_url && (
                <div>
                  <div className="eyebrow block mb-2">Preview</div>
                  <img src={resolveMediaUrl(adForm.image_url)} alt="Ad preview" className="w-full max-w-[728px] h-auto border border-sand-300 bg-sand-100" />
                </div>
              )}

              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1" data-testid="ad-save">
                  {adEditing ? "Update Ad" : "Save Ad"}
                </button>
                {(adEditing || adForm.image_url || adForm.hyperlink) && (
                  <button type="button" onClick={resetAdForm} className="btn-ghost" data-testid="ad-cancel">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </section>
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
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full bg-sand-50 border border-sand-300 px-3 py-2 focus:outline-none focus:border-sage text-sm"
        data-testid={testid}
      />
    </div>
  );
}

function InputOpt({ label, value, onChange, testid }) {
  return (
    <div>
      <label className="eyebrow block mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-sand-50 border border-sand-300 px-3 py-2 focus:outline-none focus:border-sage text-sm"
        data-testid={testid}
      />
    </div>
  );
}

function Textarea({ label, value, onChange, rows = 4, testid }) {
  return (
    <div>
      <label className="eyebrow block mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        rows={rows}
        className="w-full bg-sand-50 border border-sand-300 px-3 py-2 focus:outline-none focus:border-sage text-sm font-mono"
        data-testid={testid}
      />
    </div>
  );
}

function stripHtml(html) {
  return (html || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();
}

function CoverPlaceholder({ className = "" }) {
  return (
    <div className={`${className} bg-gradient-to-br from-sand-100 to-sand-300 flex items-center justify-center`} aria-hidden="true">
      <span className="text-[0.65rem] uppercase tracking-[0.25em] text-forest-500">No Cover</span>
    </div>
  );
}

function CoverPlaceholderOrImage({ src, alt, className = "" }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return <CoverPlaceholder className={className} />;
  }

  return (
    <img
      src={resolveMediaUrl(src)}
      alt={alt}
      onError={() => setFailed(true)}
      className={`${className} object-cover bg-sand-200`}
    />
  );
}

function RichTextEditor({ label, value, onChange, testid }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "article-body min-h-[420px] px-5 py-4 focus:outline-none",
        "data-testid": testid,
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    const nextHtml = value || "";
    if (currentHtml !== nextHtml) {
      editor.commands.setContent(nextHtml, false);
    }
  }, [editor, value]);

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href || "";
    const url = window.prompt("Enter the link URL", previousUrl);
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  return (
    <div>
      <label className="eyebrow block mb-1">{label}</label>
      <div className="border border-sand-300 bg-white">
        <div className="border-b border-sand-300 bg-sand-50">
          <div className="flex flex-wrap gap-2 p-3">
            <EditorButton label="Paragraph" active={editor?.isActive("paragraph")} onClick={() => editor?.chain().focus().setParagraph().run()} />
            <EditorButton label="H2" active={editor?.isActive("heading", { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} />
            <EditorButton label="H3" active={editor?.isActive("heading", { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} />
            <EditorDivider />
            <EditorButton label="Bold" active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()} />
            <EditorButton label="Italic" active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()} />
            <EditorButton label="Strike" active={editor?.isActive("strike")} onClick={() => editor?.chain().focus().toggleStrike().run()} />
            <EditorDivider />
            <EditorButton label="Quote" active={editor?.isActive("blockquote")} onClick={() => editor?.chain().focus().toggleBlockquote().run()} />
            <EditorButton label="Bullets" active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()} />
            <EditorButton label="Numbers" active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()} />
            <EditorDivider />
            <EditorButton label="Link" active={editor?.isActive("link")} onClick={setLink} />
            <EditorButton label="Unlink" onClick={() => editor?.chain().focus().unsetLink().run()} />
            <EditorButton label="Clear" onClick={() => editor?.chain().focus().clearNodes().unsetAllMarks().run()} />
          </div>
          <div className="px-3 pb-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-forest-500">
            Visual editor
          </div>
        </div>
        <EditorContent editor={editor} className="bg-white" />
      </div>
      <div className="text-xs text-forest-500 mt-2">
        Write visually here, similar to a classic blog editor. Formatting is saved as HTML for the article page.
      </div>
    </div>
  );
}

function EditorButton({ label, onClick, active = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-xs border transition-colors ${
        active
          ? "border-forest-900 bg-forest-900 text-white"
          : "border-sand-300 bg-white hover:border-sage hover:text-sage"
      }`}
    >
      {label}
    </button>
  );
}

function EditorDivider() {
  return <div className="w-px h-8 bg-sand-300 mx-1" aria-hidden="true" />;
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
    <div className="pt-4" data-testid="admin-posts-pagination">
      <div className="flex flex-wrap items-center gap-2 border-t border-sand-300 pt-4">
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

function Select({ label, value, onChange, options, testid }) {
  return (
    <div>
      <label className="eyebrow block mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-sand-50 border border-sand-300 px-3 py-2 focus:outline-none focus:border-sage text-sm"
        data-testid={testid}
      >
        {options.map((o) => <option key={o} value={o}>{formatCategoryLabel(o)}</option>)}
      </select>
    </div>
  );
}
