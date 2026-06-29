import { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { createGalleryItem, updateGalleryItem } from "@/redux/actions/galleryActions";
import {
  Image as ImageIcon, Video, UploadCloud, MapPin, Hash,
  Eye, ArrowLeft, X,
} from "lucide-react";

function getYouTubeThumbnail(url) {
  try {
    const m = url?.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null;
  } catch { return null; }
}

function UploadZone({ preview, onChange, disabled }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const handle = (file) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) return alert("Only JPG, PNG, WebP, GIF allowed.");
    if (file.size > 5 * 1024 * 1024) return alert("Max file size is 5 MB.");
    onChange(file);
  };

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files?.[0]); }}
      className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${dragging ? "border-[#078DD4] bg-sky-50" : "border-slate-200 bg-slate-50 hover:border-[#078DD4] hover:bg-sky-50/40"} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      style={{ minHeight: 160 }}
    >
      {preview ? (
        <>
          <img src={preview} alt="preview" className="w-full object-cover" style={{ maxHeight: 220 }} />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <UploadCloud size={20} className="text-white mb-1" />
            <p className="text-white text-xs font-semibold">Change image</p>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          <UploadCloud size={26} className="text-slate-300 mb-2" />
          <p className="text-sm font-medium text-slate-500">Drop image or click to upload</p>
          <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP · max 5 MB</p>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" disabled={disabled} onChange={(e) => handle(e.target.files?.[0])} />
    </div>
  );
}

function Toggle({ value, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${value ? "bg-[#078DD4]" : "bg-slate-200"}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  );
}

const FIELD_CLS = "w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#078DD4] focus:bg-white transition-all";
const LABEL_CLS = "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5";
const ERR_CLS = "text-red-500 text-xs mt-1";

export default function GalleryItemForm({ initialData, itemId }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const isEdit = !!itemId;

  const [form, setForm] = useState(() => ({
    name: initialData?.name || "",
    location: initialData?.location || "",
    type: initialData?.type || "photo",
    videoUrl: initialData?.videoUrl || "",
    order: initialData?.order ?? "",
    isActive: initialData?.isActive !== false,
    imageFile: null,
    imagePreview: initialData?.image || "",
  }));
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (k, v) => { setForm((p) => ({ ...p, [k]: v })); setErrors((p) => ({ ...p, [k]: "" })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (form.type === "photo" && !initialData?.image && !form.imageFile) e.imageFile = "Please upload an image";
    if (form.type === "video" && !form.videoUrl.trim()) e.videoUrl = "Video URL is required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    setErrors(e);
    setApiError("");
    if (Object.keys(e).length) return;

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("type", form.type);
      if (form.location.trim()) fd.append("location", form.location.trim());
      if (form.type === "video") fd.append("videoUrl", form.videoUrl.trim());
      if (form.order !== "") fd.append("order", parseInt(form.order) || 0);
      fd.append("isActive", form.isActive);
      if (form.imageFile) fd.append("image", form.imageFile);

      const res = isEdit
        ? await dispatch(updateGalleryItem(itemId, fd, router))
        : await dispatch(createGalleryItem(fd, router));

      if (res?.status) router.push("/gallery");
      else setApiError(res?.data?.message || res?.message || "Something went wrong.");
    } catch (err) {
      setApiError(err?.message || "Something went wrong.");
    } finally { setSaving(false); }
  };

  const ytThumb = form.type === "video" && form.videoUrl ? getYouTubeThumbnail(form.videoUrl) : null;

  return (
    <div className="min-h-screen" style={{ background: "#f8fafc" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/gallery")}
            className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{isEdit ? "Edit Item" : "Add Gallery Item"}</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {isEdit ? "Update this gallery item" : "Upload a new photo or video"}
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Type selector */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <label className={LABEL_CLS}>Type</label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {[{ val: "photo", Icon: ImageIcon, label: "Photo" }, { val: "video", Icon: Video, label: "Video" }].map(({ val, Icon, label }) => (
                <button
                  key={val}
                  onClick={() => set("type", val)}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${form.type === val ? "border-[#078DD4] bg-sky-50 text-[#078DD4]" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
                >
                  <Icon size={16} /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Media upload / URL */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            {form.type === "photo" ? (
              <>
                <label className={LABEL_CLS}>Image {!isEdit && <span className="text-red-400 normal-case font-normal">*</span>}</label>
                <UploadZone
                  preview={form.imagePreview}
                  onChange={(file) => setForm((p) => ({ ...p, imageFile: file, imagePreview: URL.createObjectURL(file) }))}
                  disabled={saving}
                />
                {errors.imageFile && <p className={ERR_CLS}>{errors.imageFile}</p>}
              </>
            ) : (
              <>
                <label className={LABEL_CLS}>Video URL <span className="text-red-400 normal-case font-normal">*</span></label>
                <input
                  type="url"
                  placeholder="https://youtube.com/watch?v=…"
                  value={form.videoUrl}
                  onChange={(e) => set("videoUrl", e.target.value)}
                  className={`${FIELD_CLS} ${errors.videoUrl ? "border-red-300 bg-red-50" : ""}`}
                />
                {errors.videoUrl && <p className={ERR_CLS}>{errors.videoUrl}</p>}
                {ytThumb && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-slate-100">
                    <img src={ytThumb} alt="thumbnail" className="w-full h-36 object-cover" />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Details */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div>
              <label className={LABEL_CLS}>Name <span className="text-red-400 normal-case font-normal">*</span></label>
              <input
                type="text"
                placeholder="e.g. Villa Exterior View"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className={`${FIELD_CLS} ${errors.name ? "border-red-300 bg-red-50" : ""}`}
              />
              {errors.name && <p className={ERR_CLS}>{errors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLS}>Location</label>
                <div className="relative">
                  <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Noida, UP"
                    value={form.location}
                    onChange={(e) => set("location", e.target.value)}
                    className={`${FIELD_CLS} pl-9`}
                  />
                </div>
              </div>
              <div>
                <label className={LABEL_CLS}>Display Order</label>
                <div className="relative">
                  <Hash size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    placeholder="0"
                    min={0}
                    value={form.order}
                    onChange={(e) => set("order", e.target.value)}
                    className={`${FIELD_CLS} pl-9`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Visibility */}
          <Toggle
            value={form.isActive}
            onChange={(v) => set("isActive", v)}
            label="Active / Visible"
            description="Show this item on the public website"
          />

          {/* API error */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-medium">
              {apiError}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => router.push("/gallery")}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: "#078DD4" }}
            >
              {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Item"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
