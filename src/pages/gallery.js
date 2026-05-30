import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import Head from "next/head";
import isAuth from "@/components/isAuth";
import { fetchGallery, updateGalleryItem, deleteGalleryItem } from "@/redux/actions/galleryActions";
import { setCurrentItem } from "@/redux/slices/gallerySlice";
import {
  Plus, Pencil, Trash2, Image as ImageIcon, Video,
  Eye, EyeOff, LayoutGrid, List, CheckCircle2,
} from "lucide-react";

function getYouTubeThumbnail(url) {
  try {
    const m = url?.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null;
  } catch { return null; }
}

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

function DeleteModal({ onClose, onConfirm, deleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
        <div className="w-11 h-11 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 size={20} className="text-red-500" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">Delete item?</h3>
        <p className="text-sm text-slate-400 mb-6">This action cannot be undone.</p>
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

function GalleryCard({ item, onEdit, onDelete, onToggleActive, toggling }) {
  const isVideo = item.type === "video";
  const thumb = isVideo ? getYouTubeThumbnail(item.videoUrl) : item.image;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden group hover:shadow-md transition-shadow">
      <div className="relative overflow-hidden bg-slate-100" style={{ height: 172 }}>
        {thumb
          ? <img src={thumb} alt={item.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center">
              {isVideo ? <Video size={28} className="text-slate-300" /> : <ImageIcon size={28} className="text-slate-300" />}
            </div>}

        <span className={`absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${isVideo ? "bg-[#0d1f35] text-white" : "bg-[#078DD4] text-white"}`}>
          {isVideo ? <Video size={9} /> : <ImageIcon size={9} />}
          {isVideo ? "Video" : "Photo"}
        </span>

        <span className={`absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${item.isActive ? "bg-[#078DD4] text-white" : "bg-slate-400 text-white"}`}>
          {item.isActive ? <Eye size={9} /> : <EyeOff size={9} />}
          {item.isActive ? "Active" : "Hidden"}
        </span>

        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5">
          <button
            onClick={() => onEdit(item)}
            className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-slate-700 hover:text-[#078DD4] shadow-sm transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onToggleActive(item)}
            disabled={toggling === item._id}
            className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm transition-colors disabled:opacity-50"
          >
            {item.isActive ? <EyeOff size={14} className="text-[#0d1f35]" /> : <Eye size={14} className="text-[#078DD4]" />}
          </button>
          <button
            onClick={() => onDelete(item._id)}
            className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 shadow-sm transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="px-3.5 py-3">
        <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-slate-400 truncate">{item.location || "—"}</p>
          <span className="text-[11px] text-slate-300 font-mono">#{item.order ?? 0}</span>
        </div>
      </div>
    </div>
  );
}

function ListRow({ item, onEdit, onDelete, onToggleActive, toggling, index }) {
  const isVideo = item.type === "video";
  const thumb = isVideo ? getYouTubeThumbnail(item.videoUrl) : item.image;

  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors group">
      <td className="px-4 py-3 text-slate-400 text-sm">{index + 1}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-9 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
            {thumb
              ? <img src={thumb} alt={item.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center">
                  {isVideo ? <Video size={12} className="text-slate-300" /> : <ImageIcon size={12} className="text-slate-300" />}
                </div>}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate max-w-44">{item.name}</p>
            {item.location && <p className="text-xs text-slate-400 truncate">{item.location}</p>}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold ${isVideo ? "bg-slate-100 text-[#0d1f35]" : "bg-[#e0f2fe] text-[#078DD4]"}`}>
          {isVideo ? <Video size={10} /> : <ImageIcon size={10} />}
          {isVideo ? "Video" : "Photo"}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-slate-400 font-mono">#{item.order ?? 0}</td>
      <td className="px-4 py-3">
        <button
          onClick={() => onToggleActive(item)}
          disabled={toggling === item._id}
          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold transition-colors disabled:opacity-50 ${item.isActive ? "bg-[#e0f2fe] text-[#078DD4] hover:bg-[#bae6fd]" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
        >
          {item.isActive ? <CheckCircle2 size={10} /> : <EyeOff size={10} />}
          {item.isActive ? "Active" : "Hidden"}
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-[#078DD4] hover:bg-sky-50 transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={() => onDelete(item._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function Gallery(props) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { items: rawItems, loading, total } = useSelector((s) => s.gallery);
  const items = Array.isArray(rawItems) ? rawItems : [];

  const [typeFilter, setTypeFilter] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    dispatch(fetchGallery({ page: 1, limit: 200, type: typeFilter }, router));
  }, [typeFilter]);

  const handleEdit = (item) => {
    dispatch(setCurrentItem(item));
    router.push(`/gallery/${item._id}`);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await dispatch(deleteGalleryItem(deleteId, router));
      if (res?.status) {
        props.toaster?.({ type: "success", message: "Item deleted" });
        setDeleteId(null);
      }
    } catch { props.toaster?.({ type: "error", message: "Delete failed" }); }
    finally { setDeleting(false); }
  };

  const handleToggleActive = async (item) => {
    setToggling(item._id);
    try {
      const fd = new FormData();
      fd.append("isActive", !item.isActive);
      await dispatch(updateGalleryItem(item._id, fd, router));
    } finally { setToggling(null); }
  };

  const photos = items.filter((i) => i.type === "photo");
  const videos = items.filter((i) => i.type === "video");
  const active = items.filter((i) => i.isActive);

  const TABS = [
    { value: "", label: "All" },
    { value: "photo", label: "Photos" },
    { value: "video", label: "Videos" },
  ];

  return (
    <>
      <Head><title>Gallery | Lotusss Admin</title></Head>

      {deleteId && (
        <DeleteModal onClose={() => setDeleteId(null)} onConfirm={handleDelete} deleting={deleting} />
      )}

      <div className="min-h-screen" style={{ background: "#f8fafc" }}>
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Gallery</h1>
              <p className="text-sm text-slate-400 mt-0.5">{total} items total</p>
            </div>
            <Link href="/gallery/add">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm" style={{ background: "#078DD4" }}>
                <Plus size={16} />
                Add Item
              </button>
            </Link>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total" value={total} icon={LayoutGrid} color="#078DD4" />
            <StatCard label="Photos" value={photos.length} icon={ImageIcon} color="#0d1f35" />
            <StatCard label="Videos" value={videos.length} icon={Video} color="#0d1f35" />
            <StatCard label="Active" value={active.length} icon={Eye} color="#078DD4" />
          </div>

          {/* Filter bar */}
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              {TABS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTypeFilter(t.value)}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${typeFilter === t.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-slate-800" : "text-slate-400 hover:text-slate-600"}`}
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-all ${viewMode === "list" ? "bg-white shadow-sm text-slate-800" : "text-slate-400 hover:text-slate-600"}`}
              >
                <List size={14} />
              </button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="bg-white border border-slate-200 rounded-xl flex items-center justify-center py-24">
              <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "#078DD4", borderTopColor: "transparent" }} />
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <ImageIcon size={22} className="text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-600 mb-1">No items yet</p>
              <p className="text-xs text-slate-400 mb-5">Add your first photo or video to get started.</p>
              <Link href="/gallery/add">
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ background: "#078DD4" }}>
                  <Plus size={14} /> Add Item
                </button>
              </Link>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item) => (
                <GalleryCard
                  key={item._id} item={item}
                  onEdit={handleEdit} onDelete={setDeleteId}
                  onToggleActive={handleToggleActive} toggling={toggling}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-100">
                    <tr>
                      {["#", "Item", "Type", "Order", "Status", ""].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <ListRow
                        key={item._id} item={item} index={i}
                        onEdit={handleEdit} onDelete={setDeleteId}
                        onToggleActive={handleToggleActive} toggling={toggling}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default isAuth(Gallery);
