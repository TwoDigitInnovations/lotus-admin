import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import isAuth from "@/components/isAuth";
import { Api, ApiFormData } from "@/services/service";
import {
  Plus,
  Pencil,
  Trash2,
  Image,
  Video,
  GripVertical,
  Eye,
  EyeOff,
} from "lucide-react";

function Toast({ msg, type }) {
  if (!msg) return null;
  return (
    <div
      className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-lg ${type === "error" ? "bg-red-500 text-white" : "bg-[#078DD4] text-white"}`}
    >
      {msg}
    </div>
  );
}

function DeleteModal({ banner, onClose, onConfirm, deleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
        <div className="w-11 h-11 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 size={20} className="text-red-500" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">
          Delete banner?
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {deleting && (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BannerForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    type: initial?.type || "image",
    title: initial?.title || "",
    subtitle: initial?.subtitle || "",
    ctaText: initial?.ctaText || "",
    ctaLink: initial?.ctaLink || "",
    order: initial?.order ?? 0,
    isActive: initial?.isActive !== false,
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initial?.media || "");
  const fileRef = useRef();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    set("type", f.type.startsWith("video/") ? "video" : "image");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!initial && !file) return alert("Please select an image or video.");
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append("media", file);
    onSave(fd);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 my-4">
        <h2 className="text-base font-bold text-slate-900 mb-5">
          {initial ? "Edit Banner" : "Add Banner"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Media Upload */}
          <div
            onClick={() => fileRef.current.click()}
            className="border-2 border-dashed border-slate-200 rounded-xl overflow-hidden cursor-pointer hover:border-[#078DD4] transition-colors"
            style={{ minHeight: 160 }}
          >
            {preview ? (
              form.type === "video" ? (
                <video
                  src={preview}
                  className="w-full h-40 object-cover"
                  muted
                />
              ) : (
                <img
                  src={preview}
                  className="w-full h-40 object-cover"
                  alt="preview"
                />
              )
            ) : (
              <div className="h-40 flex flex-col items-center justify-center gap-2 text-slate-400">
                <Image size={28} />
                <span className="text-sm">Click to upload image or video</span>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFile}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">
                Title
              </label>
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#078DD4]"
                placeholder="Slide title"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">
                Subtitle
              </label>
              <input
                value={form.subtitle}
                onChange={(e) => set("subtitle", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#078DD4]"
                placeholder="Slide subtitle"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">
                CTA Text
              </label>
              <input
                value={form.ctaText}
                onChange={(e) => set("ctaText", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#078DD4]"
                placeholder="e.g. Explore Now"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">
                CTA Link
              </label>
              <input
                value={form.ctaLink}
                onChange={(e) => set("ctaLink", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#078DD4]"
                placeholder="/projects"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">
                Order
              </label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => set("order", parseInt(e.target.value))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#078DD4]"
                min={0}
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => set("isActive", e.target.checked)}
                  className="w-4 h-4 accent-[#078DD4]"
                />
                <span className="text-sm text-slate-700">Active</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              style={{ background: "#078DD4" }}
            >
              {saving && (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {saving ? "Saving…" : "Save Banner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BannersPage() {
  const router = useRouter();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await Api("get", "hero-banners/admin/all", "", router);
      if (res?.status) setBanners(res.data?.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (b) => {
    setEditing(b);
    setFormOpen(true);
  };

  const handleSave = async (fd) => {
    setSaving(true);
    try {
      const res = editing
        ? await ApiFormData("put", `hero-banners/${editing._id}`, fd, router)
        : await ApiFormData("post", "hero-banners", fd, router);
      if (res?.status) {
        showToast(editing ? "Banner updated!" : "Banner added!");
        setFormOpen(false);
        load();
      } else {
        showToast(res?.message || "Failed to save", "error");
      }
    } catch {
      showToast("Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(confirmDel._id);
    try {
      const res = await Api(
        "delete",
        `hero-banners/${confirmDel._id}`,
        "",
        router,
      );
      if (res?.status) {
        showToast("Banner deleted!");
        setBanners((prev) => prev.filter((b) => b._id !== confirmDel._id));
      }
    } finally {
      setDeleting(null);
      setConfirmDel(null);
    }
  };

  const toggleActive = async (b) => {
    const fd = new FormData();
    fd.append("isActive", !b.isActive);
    const res = await ApiFormData("put", `hero-banners/${b._id}`, fd, router);
    if (res?.status)
      setBanners((prev) =>
        prev.map((x) =>
          x._id === b._id ? { ...x, isActive: !b.isActive } : x,
        ),
      );
  };

  return (
    <>
      <Head>
        <title>Hero Banners — Admin</title>
      </Head>
      <Toast {...toast} />
      {formOpen && (
        <BannerForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => setFormOpen(false)}
          saving={saving}
        />
      )}
      {confirmDel && (
        <DeleteModal
          banner={confirmDel}
          onClose={() => setConfirmDel(null)}
          onConfirm={handleDelete}
          deleting={!!deleting}
        />
      )}

      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Hero Banners</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage home page banner slides (images &amp; videos)
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ background: "#078DD4" }}
          >
            <Plus size={16} /> Add Banner
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="w-8 h-8 border-2 border-[#078DD4]/20 border-t-[#078DD4] rounded-full animate-spin" />
          </div>
        ) : banners.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Image size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No banners yet. Add your first one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {banners.map((b) => (
              <div
                key={b._id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative bg-slate-100" style={{ height: 160 }}>
                  {b.type === "video" ? (
                    <video
                      src={b.media}
                      className="w-full h-full object-cover"
                      muted
                    />
                  ) : (
                    <img
                      src={b.media}
                      alt={b.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${b.type === "video" ? "bg-purple-500 text-white" : "bg-[#078DD4] text-white"}`}
                    >
                      {b.type === "video" ? "Video" : "Image"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${b.isActive ? "bg-green-500 text-white" : "bg-slate-400 text-white"}`}
                    >
                      {b.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/50 text-white text-[10px] font-semibold">
                    #{b.order}
                  </span>
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {b.title || (
                      <span className="text-slate-400 italic">No title</span>
                    )}
                  </p>
                  {b.subtitle && (
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {b.subtitle}
                    </p>
                  )}
                  {b.ctaText && (
                    <p className="text-xs text-[#078DD4] mt-1">
                      CTA: {b.ctaText} → {b.ctaLink}
                    </p>
                  )}
                </div>
                <div className="px-3 pb-3 flex gap-2">
                  <button
                    onClick={() => toggleActive(b)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:border-[#078DD4] hover:text-[#078DD4] transition-colors"
                  >
                    {b.isActive ? <EyeOff size={11} /> : <Eye size={11} />}{" "}
                    {b.isActive ? "Hide" : "Show"}
                  </button>
                  <button
                    onClick={() => openEdit(b)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:border-[#078DD4] hover:text-[#078DD4] transition-colors"
                  >
                    <Pencil size={11} /> Edit
                  </button>
                  <button
                    onClick={() => setConfirmDel(b)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:border-red-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={11} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default isAuth(BannersPage);
