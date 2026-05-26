import { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { createBlog, updateBlog } from "@/redux/actions/blogActions";
import { ArrowLeft, UploadCloud, Plus, Trash2, Globe, X } from "lucide-react";

const toSlug = (str) =>
  str.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

const FIELD_CLS = "w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#078DD4] focus:bg-white transition-all";
const LABEL_CLS = "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5";
const ERR_CLS = "text-red-500 text-xs mt-1";

function UploadZone({ preview, onChange, onClear }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const handle = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return alert("Select an image file.");
    if (file.size > 5 * 1024 * 1024) return alert("Max 5 MB.");
    onChange(file, URL.createObjectURL(file));
  };

  return preview ? (
    <div className="relative rounded-xl overflow-hidden">
      <img src={preview} alt="cover" className="w-full object-cover rounded-xl" style={{ maxHeight: 240 }} />
      <button
        onClick={onClear}
        className="absolute top-2.5 right-2.5 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
      >
        <X size={13} />
      </button>
    </div>
  ) : (
    <>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files[0]); }}
        onClick={() => inputRef.current.click()}
        className={`rounded-xl border-2 border-dashed transition-all cursor-pointer py-10 text-center ${dragging ? "border-[#078DD4] bg-sky-50" : "border-slate-200 bg-slate-50 hover:border-[#078DD4] hover:bg-sky-50/40"}`}
      >
        <UploadCloud size={24} className="text-slate-300 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-500">Drop image or click to browse</p>
        <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP · max 5 MB</p>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handle(e.target.files[0])} />
    </>
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

export default function BlogPostForm({ initialData, blogId }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const isEdit = !!blogId;

  const [form, setForm] = useState(() => ({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    content: initialData?.content?.length ? initialData.content : [""],
    isPublished: initialData?.isPublished || false,
    imageFile: null,
    imagePreview: initialData?.image || "",
  }));
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleTitle = (e) => {
    const t = e.target.value;
    set("title", t);
    if (!slugTouched) set("slug", toSlug(t));
  };

  const handleSlug = (e) => {
    setSlugTouched(true);
    set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
  };

  const addParagraph = () => set("content", [...form.content, ""]);
  const removeParagraph = (i) => set("content", form.content.filter((_, idx) => idx !== i));
  const updateParagraph = (i, val) => set("content", form.content.map((p, idx) => idx === i ? val : p));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.slug.trim()) e.slug = "Slug is required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("slug", form.slug.trim());
      fd.append("description", form.description.trim());
      fd.append("isPublished", form.isPublished);
      form.content.filter((p) => p.trim()).forEach((p) => fd.append("content", p));
      if (form.imageFile) fd.append("image", form.imageFile);

      const res = isEdit
        ? await dispatch(updateBlog(blogId, fd, router))
        : await dispatch(createBlog(fd, router));

      if (res?.status) router.push("/blogs");
      else alert(res?.data?.message || res?.message || "Something went wrong.");
    } catch (err) {
      alert(err?.message || "Something went wrong.");
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen" style={{ background: "#f8fafc" }}>
      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/blogs")}
            className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{isEdit ? "Edit Post" : "New Blog Post"}</h1>
            <p className="text-sm text-slate-400 mt-0.5">{isEdit ? "Update this article" : "Write and publish a new article"}</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Title & Slug */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div>
              <label className={LABEL_CLS}>Title <span className="text-red-400 normal-case font-normal">*</span></label>
              <input
                type="text"
                placeholder="Enter post title…"
                value={form.title}
                onChange={handleTitle}
                className={`${FIELD_CLS} ${errors.title ? "border-red-300 bg-red-50" : ""}`}
              />
              {errors.title && <p className={ERR_CLS}>{errors.title}</p>}
            </div>
            <div>
              <label className={LABEL_CLS}>Slug <span className="text-red-400 normal-case font-normal">*</span></label>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm font-mono">/</span>
                <input
                  type="text"
                  placeholder="post-url-slug"
                  value={form.slug}
                  onChange={handleSlug}
                  className={`${FIELD_CLS} flex-1 ${errors.slug ? "border-red-300 bg-red-50" : ""}`}
                />
              </div>
              {errors.slug && <p className={ERR_CLS}>{errors.slug}</p>}
            </div>
            <div>
              <label className={LABEL_CLS}>Description</label>
              <textarea
                placeholder="Short description for SEO and preview…"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                className={`${FIELD_CLS} resize-none`}
              />
            </div>
          </div>

          {/* Cover image */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <label className={LABEL_CLS}>Cover Image</label>
            <UploadZone
              preview={form.imagePreview}
              onChange={(file, url) => setForm((p) => ({ ...p, imageFile: file, imagePreview: url }))}
              onClear={() => setForm((p) => ({ ...p, imageFile: null, imagePreview: "" }))}
            />
          </div>

          {/* Content paragraphs */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <label className={`${LABEL_CLS} mb-0`}>Content Paragraphs</label>
              <button
                onClick={addParagraph}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "#078DD4" }}
              >
                <Plus size={12} /> Add Paragraph
              </button>
            </div>
            <div className="space-y-3">
              {form.content.map((p, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-400 shrink-0 mt-2.5">{i + 1}</span>
                  <textarea
                    value={p}
                    onChange={(e) => updateParagraph(i, e.target.value)}
                    placeholder={`Paragraph ${i + 1}…`}
                    rows={3}
                    className={`${FIELD_CLS} flex-1 resize-y`}
                  />
                  {form.content.length > 1 && (
                    <button
                      onClick={() => removeParagraph(i)}
                      className="mt-2.5 w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors shrink-0"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Publish toggle */}
          <Toggle
            value={form.isPublished}
            onChange={(v) => set("isPublished", v)}
            label="Publish"
            description="Make this post visible to the public"
          />

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => router.push("/blogs")}
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
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Publish Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
