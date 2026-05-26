import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import isAuth from "@/components/isAuth";
import { fetchBlogs, deleteBlog } from "@/redux/actions/blogActions";
import { setCurrentBlog } from "@/redux/slices/blogSlice";
import { Plus, Pencil, Trash2, FileText, Globe, BookOpen, AlignLeft } from "lucide-react";

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color + "18" }}>
        <Icon size={18} style={{ color }} />
      </div>
    </div>
  );
}

function DeleteModal({ blog, onClose, onConfirm, deleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
        <div className="w-11 h-11 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 size={20} className="text-red-500" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">Delete blog?</h3>
        <p className="text-sm text-slate-400 mb-1">
          &quot;{blog?.title}&quot;
        </p>
        <p className="text-xs text-slate-400 mb-6">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {deleting && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BlogCard({ blog, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="relative bg-slate-100 overflow-hidden" style={{ height: 176 }}>
        {blog.image
          ? <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center">
              <FileText size={32} className="text-slate-300" />
            </div>}
        <span className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md text-[11px] font-semibold ${blog.isPublished ? "bg-emerald-500 text-white" : "bg-amber-400 text-white"}`}>
          {blog.isPublished ? "Published" : "Draft"}
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-1.5">
        <p className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">{blog.title}</p>
        <p className="text-xs text-slate-400">/{blog.slug}</p>
        {blog.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{blog.description}</p>
        )}
        <div className="flex items-center gap-3 mt-1">
          {blog.content?.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <AlignLeft size={10} /> {blog.content.length} para
            </span>
          )}
        </div>
      </div>

      <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          {blog.isPublished && blog.publishedAt ? fmt(blog.publishedAt) : fmt(blog.createdAt)}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(blog)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:border-[#078DD4] hover:text-[#078DD4] transition-colors"
          >
            <Pencil size={11} /> Edit
          </button>
          <button
            onClick={() => onDelete(blog)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:border-red-300 hover:text-red-500 transition-colors"
          >
            <Trash2 size={11} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function BlogsPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const rawBlogs = useSelector((s) => s.blog.blogs);
  const loading = useSelector((s) => s.blog.loading);
  const total = useSelector((s) => s.blog.total);
  const blogs = Array.isArray(rawBlogs) ? rawBlogs : [];

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { dispatch(fetchBlogs({}, router)); }, [dispatch]);

  const filtered = blogs.filter((b) => {
    const matchFilter = filter === "all" || (filter === "published" ? b.isPublished : !b.isPublished);
    const q = search.toLowerCase();
    const matchSearch = !q || b.title?.toLowerCase().includes(q) || b.slug?.toLowerCase().includes(q) || b.description?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const stats = {
    total: blogs.length,
    published: blogs.filter((b) => b.isPublished).length,
    draft: blogs.filter((b) => !b.isPublished).length,
  };

  const handleEdit = (blog) => {
    dispatch(setCurrentBlog(blog));
    router.push(`/blogs/${blog._id}`);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await dispatch(deleteBlog(deleteTarget._id, router));
      setDeleteTarget(null);
    } catch { } finally { setDeleting(false); }
  };

  const TABS = [
    { id: "all", label: `All (${stats.total})` },
    { id: "published", label: `Published (${stats.published})` },
    { id: "draft", label: `Drafts (${stats.draft})` },
  ];

  return (
    <>
      <Head><title>Blogs | Lotusss Admin</title></Head>

      {deleteTarget && (
        <DeleteModal
          blog={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}

      <div className="min-h-screen" style={{ background: "#f8fafc" }}>
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Blog Posts</h1>
              <p className="text-sm text-slate-400 mt-0.5">{total} post{total !== 1 ? "s" : ""} total</p>
            </div>
            <Link href="/blogs/add">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm" style={{ background: "#078DD4" }}>
                <Plus size={16} /> Write Post
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Total Posts" value={stats.total} icon={BookOpen} color="#078DD4" />
            <StatCard label="Published" value={stats.published} icon={Globe} color="#059669" />
            <StatCard label="Drafts" value={stats.draft} icon={FileText} color="#d97706" />
          </div>

          {/* Filter bar */}
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFilter(t.id)}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${filter === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts…"
              className="border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none text-slate-800 placeholder-slate-400 w-52 focus:border-[#078DD4] transition-colors"
            />
          </div>

          {/* Content */}
          {loading ? (
            <div className="bg-white border border-slate-200 rounded-xl flex items-center justify-center py-24">
              <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "#078DD4", borderTopColor: "transparent" }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <FileText size={22} className="text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-600 mb-1">No posts found</p>
              <p className="text-xs text-slate-400 mb-5">
                {search ? "Try a different search." : "Click 'Write Post' to publish your first article."}
              </p>
              {!search && (
                <Link href="/blogs/add">
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ background: "#078DD4" }}>
                    <Plus size={14} /> Write Post
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((b) => (
                <BlogCard key={b._id} blog={b} onEdit={handleEdit} onDelete={setDeleteTarget} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default isAuth(BlogsPage);
