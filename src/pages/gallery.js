import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} from "@/redux/actions/galleryActions";
import isAuth from "@/components/isAuth";
import {
  Plus, Pencil, Trash2, X, Image as ImageIcon,
  Video, UploadCloud, Eye, EyeOff, LayoutGrid,
  List, Link as LinkIcon, MapPin, Hash, CheckCircle2,
} from "lucide-react";

// ── Constants ─────────────────────────────────────────────────────────────────

const TYPE_TABS = [
  { value: "", label: "All" },
  { value: "photo", label: "Photos" },
  { value: "video", label: "Videos" },
];

const EMPTY_FORM = {
  name: "", location: "", type: "photo",
  videoUrl: "", order: "", isActive: true,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function isYouTube(url) {
  return /youtube\.com|youtu\.be/.test(url || "");
}

function getYouTubeThumbnail(url) {
  try {
    const m = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null;
  } catch { return null; }
}

// ── Image Upload Zone ─────────────────────────────────────────────────────────

function UploadZone({ preview, onChange, disabled }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) return;
    onChange(file);
  };

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault(); setDragging(false);
        handleFile(e.dataTransfer.files?.[0]);
      }}
      className={`relative w-full rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden
        ${dragging ? "border-[#078DD4] bg-blue-50" : "border-gray-200 bg-gray-50 hover:border-[#078DD4] hover:bg-blue-50/40"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      style={{ minHeight: 160 }}
    >
      {preview ? (
        <>
          <img src={preview} alt="preview" className="w-full h-full object-cover" style={{ minHeight: 160, maxHeight: 220 }} />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <UploadCloud size={22} className="text-white mb-1" />
            <p className="text-white text-xs font-semibold">Change image</p>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          <UploadCloud size={28} className="text-gray-300 mb-2" />
          <p className="text-sm font-medium text-gray-500">Drop image here or click to upload</p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP, GIF · max 5 MB</p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        disabled={disabled}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

// ── Add / Edit Modal ──────────────────────────────────────────────────────────

function GalleryModal({ item, onClose, onSave, saving }) {
  const [form, setForm] = useState(
    item
      ? {
          name: item.name || "",
          location: item.location || "",
          type: item.type || "photo",
          videoUrl: item.videoUrl || "",
          order: item.order ?? "",
          isActive: item.isActive ?? true,
        }
      : { ...EMPTY_FORM },
  );
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(item?.image || null);
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const handleImage = (file) => {
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setErrors((p) => ({ ...p, image: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.type) e.type = "Type is required";
    if (form.type === "photo" && !item?.image && !imageFile)
      e.image = "Please upload an image";
    if (form.type === "video" && !form.videoUrl.trim())
      e.videoUrl = "Video URL is required";
    return e;
  };

  const submit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("type", form.type);
    if (form.location.trim()) fd.append("location", form.location.trim());
    if (form.type === "video") fd.append("videoUrl", form.videoUrl.trim());
    if (form.order !== "") fd.append("order", parseInt(form.order) || 0);
    fd.append("isActive", form.isActive);
    if (imageFile) fd.append("image", imageFile);

    onSave(fd, item?._id);
  };

  const ytThumb = form.type === "video" && form.videoUrl
    ? getYouTubeThumbnail(form.videoUrl) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between shrink-0" style={{ background: "#0d1f35" }}>
          <div className="flex items-center gap-2.5">
            {form.type === "video"
              ? <Video size={18} className="text-[#078DD4]" />
              : <ImageIcon size={18} className="text-[#078DD4]" />}
            <h2 className="text-white font-semibold text-sm">
              {item ? "Edit Gallery Item" : "Add Gallery Item"}
            </h2>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Type selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Type <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { val: "photo", Icon: ImageIcon, label: "Photo" },
                { val: "video", Icon: Video, label: "Video" },
              ].map(({ val, Icon, label }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => set("type", val)}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    form.type === val
                      ? "border-[#078DD4] bg-blue-50 text-[#078DD4]"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Villa Exterior View"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all
                ${errors.name ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50 focus:border-[#078DD4] focus:bg-white"}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Upload (photo) or URL (video) */}
          {form.type === "photo" ? (
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                Image <span className="text-red-400">*</span>
              </label>
              <UploadZone preview={preview} onChange={handleImage} disabled={saving} />
              {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                Video URL <span className="text-red-400">*</span>
              </label>
              <div className={`flex items-center gap-3 border rounded-xl px-4 py-2.5 transition-all
                ${errors.videoUrl ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50 focus-within:border-[#078DD4] focus-within:bg-white"}`}>
                <LinkIcon size={15} className="text-gray-400 shrink-0" />
                <input
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={form.videoUrl}
                  onChange={(e) => set("videoUrl", e.target.value)}
                  className="bg-transparent outline-none w-full text-sm text-gray-800 placeholder-gray-400"
                />
              </div>
              {errors.videoUrl && <p className="text-red-500 text-xs mt-1">{errors.videoUrl}</p>}
              {ytThumb && (
                <div className="mt-2 rounded-xl overflow-hidden border border-gray-100">
                  <img src={ytThumb} alt="YouTube thumbnail" className="w-full h-32 object-cover" />
                </div>
              )}
            </div>
          )}

          {/* Location + Order (2 cols) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                Location
              </label>
              <div className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 transition-all
                border-gray-200 bg-gray-50 focus-within:border-[#078DD4] focus-within:bg-white`}>
                <MapPin size={13} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Noida, UP"
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                  className="bg-transparent outline-none w-full text-sm text-gray-800 placeholder-gray-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                Display Order
              </label>
              <div className="flex items-center gap-2 border border-gray-200 bg-gray-50 focus-within:border-[#078DD4] focus-within:bg-white rounded-xl px-3 py-2.5 transition-all">
                <Hash size={13} className="text-gray-400 shrink-0" />
                <input
                  type="number"
                  placeholder="0"
                  min={0}
                  value={form.order}
                  onChange={(e) => set("order", e.target.value)}
                  className="bg-transparent outline-none w-full text-sm text-gray-800 placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* isActive toggle */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-700">Active / Visible</p>
              <p className="text-xs text-gray-400 mt-0.5">Show this item on the public website</p>
            </div>
            <button
              type="button"
              onClick={() => set("isActive", !form.isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0
                ${form.isActive ? "bg-[#078DD4]" : "bg-gray-200"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
                ${form.isActive ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
            style={{ background: "#078DD4" }}
          >
            {saving && (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {saving ? "Saving…" : item ? "Save Changes" : "Add Item"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Gallery Card ──────────────────────────────────────────────────────────────

function GalleryCard({ item, onEdit, onDelete, onToggleActive, toggling }) {
  const isVideo = item.type === "video";
  const thumb = isVideo
    ? getYouTubeThumbnail(item.videoUrl) || null
    : item.image || null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="relative bg-gray-100 overflow-hidden" style={{ height: 180 }}>
        {thumb ? (
          <img src={thumb} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {isVideo
              ? <Video size={32} className="text-gray-300" />
              : <ImageIcon size={32} className="text-gray-300" />}
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold backdrop-blur-sm
            ${isVideo ? "bg-purple-500/90 text-white" : "bg-[#078DD4]/90 text-white"}`}>
            {isVideo ? <Video size={10} /> : <ImageIcon size={10} />}
            {isVideo ? "Video" : "Photo"}
          </span>
        </div>

        {/* Status badge */}
        <div className="absolute top-2 right-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold backdrop-blur-sm
            ${item.isActive ? "bg-green-500/90 text-white" : "bg-gray-500/80 text-white"}`}>
            {item.isActive ? <Eye size={10} /> : <EyeOff size={10} />}
            {item.isActive ? "Active" : "Hidden"}
          </span>
        </div>

        {/* Hover actions overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button
            onClick={() => onEdit(item)}
            className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-gray-700 hover:text-[#078DD4] transition-colors shadow"
            title="Edit"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onToggleActive(item)}
            disabled={toggling === item._id}
            className="w-9 h-9 bg-white rounded-xl flex items-center justify-center transition-colors shadow disabled:opacity-50"
            title={item.isActive ? "Hide" : "Show"}
          >
            {item.isActive
              ? <EyeOff size={15} className="text-orange-400" />
              : <Eye size={15} className="text-green-500" />}
          </button>
          <button
            onClick={() => onDelete(item._id)}
            className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shadow"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="px-4 py-3">
        <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-gray-400 truncate">
            {item.location || <span className="italic">No location</span>}
          </p>
          {item.order !== undefined && (
            <span className="text-[11px] text-gray-300 font-mono">#{item.order}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── List Row (table view) ─────────────────────────────────────────────────────

function ListRow({ item, onEdit, onDelete, onToggleActive, toggling, index }) {
  const isVideo = item.type === "video";
  const thumb = isVideo ? getYouTubeThumbnail(item.videoUrl) : item.image;

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors group">
      <td className="px-4 py-3 text-gray-400 text-sm">{index + 1}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
            {thumb
              ? <img src={thumb} alt={item.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center">
                  {isVideo ? <Video size={14} className="text-gray-300" /> : <ImageIcon size={14} className="text-gray-300" />}
                </div>}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate max-w-44">{item.name}</p>
            {item.location && <p className="text-xs text-gray-400 truncate">{item.location}</p>}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
          ${isVideo ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-[#078DD4]"}`}>
          {isVideo ? <Video size={11} /> : <ImageIcon size={11} />}
          {isVideo ? "Video" : "Photo"}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-gray-400 font-mono">#{item.order ?? 0}</td>
      <td className="px-4 py-3">
        <button
          onClick={() => onToggleActive(item)}
          disabled={toggling === item._id}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors disabled:opacity-50
            ${item.isActive ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
        >
          {item.isActive ? <CheckCircle2 size={11} /> : <EyeOff size={11} />}
          {item.isActive ? "Active" : "Hidden"}
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-[#078DD4] hover:bg-blue-50 transition-colors"
            title="Edit"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(item._id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

function Gallery(props) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { items: rawItems, loading, total } = useSelector((state) => state.gallery);
  const items = Array.isArray(rawItems) ? rawItems : [];

  const [typeFilter, setTypeFilter] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(null);

  const load = useCallback(
    (type = typeFilter) => {
      dispatch(fetchGallery({ page: 1, limit: 200, type }, router));
    },
    [dispatch, typeFilter, router],
  );

  useEffect(() => { load(typeFilter); }, [typeFilter]);

  const openAdd = () => { setEditItem(null); setModalOpen(true); };
  const openEdit = (item) => { setEditItem(item); setModalOpen(true); };
  const closeModal = () => { if (!saving) { setModalOpen(false); setEditItem(null); } };

  const handleSave = async (formData, id) => {
    setSaving(true);
    try {
      const res = id
        ? await dispatch(updateGalleryItem(id, formData, router))
        : await dispatch(createGalleryItem(formData, router));

      if (res?.status) {
        props.toaster({ type: "success", message: id ? "Item updated!" : "Item added!" });
        closeModal();
      } else {
        props.toaster({ type: "error", message: res?.message || "Save failed" });
      }
    } catch (err) {
      props.toaster({ type: "error", message: err?.message || "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await dispatch(deleteGalleryItem(deleteId, router));
      if (res?.status) {
        props.toaster({ type: "success", message: "Item deleted" });
        setDeleteId(null);
      } else {
        props.toaster({ type: "error", message: res?.message || "Delete failed" });
      }
    } catch {
      props.toaster({ type: "error", message: "Delete failed" });
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (item) => {
    setToggling(item._id);
    try {
      const fd = new FormData();
      fd.append("isActive", !item.isActive);
      const res = await dispatch(updateGalleryItem(item._id, fd, router));
      if (res?.status) {
        props.toaster({
          type: "success",
          message: `Item ${!item.isActive ? "activated" : "hidden"}`,
        });
      } else {
        props.toaster({ type: "error", message: res?.message || "Failed" });
      }
    } catch {
      props.toaster({ type: "error", message: "Failed" });
    } finally {
      setToggling(null);
    }
  };

  const photos = items.filter((i) => i.type === "photo");
  const videos = items.filter((i) => i.type === "video");
  const active = items.filter((i) => i.isActive);

  return (
    <>
      {/* Add / Edit modal */}
      {modalOpen && (
        <GalleryModal
          item={editItem}
          onClose={closeModal}
          onSave={handleSave}
          saving={saving}
        />
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !deleting && setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Delete Item?</h3>
            <p className="text-sm text-gray-400 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 md:p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Gallery</h1>
            <p className="text-sm text-gray-400 mt-0.5">{total} items</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: "#078DD4" }}
          >
            <Plus size={16} />
            Add Item
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total", val: total, icon: LayoutGrid, color: "#078DD4" },
            { label: "Photos", val: photos.length, icon: ImageIcon, color: "#8B5CF6" },
            { label: "Videos", val: videos.length, icon: Video, color: "#F59E0B" },
            { label: "Active", val: active.length, icon: Eye, color: "#10B981" },
          ].map(({ label, val, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
                <div className="p-1.5 rounded-lg" style={{ background: color + "18" }}>
                  <Icon size={14} style={{ color }} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{val}</p>
            </div>
          ))}
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Type tabs */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {TYPE_TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => setTypeFilter(t.value)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  typeFilter === t.value
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-gray-800" : "text-gray-400 hover:text-gray-600"}`}
              title="Grid view"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow-sm text-gray-800" : "text-gray-400 hover:text-gray-600"}`}
              title="List view"
            >
              <List size={15} />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex items-center justify-center py-24">
            <div
              className="w-9 h-9 rounded-full border-2 animate-spin"
              style={{ borderColor: "#078DD4", borderTopColor: "transparent" }}
            />
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ImageIcon size={26} className="text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-600 mb-1">No gallery items yet</p>
            <p className="text-xs text-gray-400 mb-5">
              {typeFilter ? `No ${typeFilter}s added yet.` : "Start by adding your first photo or video."}
            </p>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all"
              style={{ background: "#078DD4" }}
            >
              <Plus size={15} />
              Add First Item
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <GalleryCard
                key={item._id}
                item={item}
                onEdit={openEdit}
                onDelete={setDeleteId}
                onToggleActive={handleToggleActive}
                toggling={toggling}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["#", "Item", "Type", "Order", "Status", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <ListRow
                      key={item._id}
                      item={item}
                      index={i}
                      onEdit={openEdit}
                      onDelete={setDeleteId}
                      onToggleActive={handleToggleActive}
                      toggling={toggling}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default isAuth(Gallery);
