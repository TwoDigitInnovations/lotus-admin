import { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { createProject, updateProject } from "@/redux/actions/projectActions";
import {
  ArrowLeft, UploadCloud, Plus, Trash2, X,
  Building2, Image as ImageIcon, AlignLeft, Shield, MapPin, FolderOpen,
} from "lucide-react";
import RichEditor from "@/components/RichEditor";

const EMPTY = {
  name: "",
  location: "",
  propertySize: "",
  price: "",
  status: "Under Construction",
  category: "residential",
  overview: "",
  reraNumber: "",
  reraUrl: "",
  aboutCity: { name: "", text: "" },
  aboutSector: { name: "", text: "" },
  documents: [],
  isFeatured: false,
  isActive: true,
  imageFile: null,
  imagePreview: "",
};

const FIELD_CLS = "w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#078DD4] focus:bg-white transition-all font-[inherit]";
const LABEL_CLS = "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5";

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

function UploadZone({ preview, onChange, onClear }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const handle = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return alert("Select an image file.");
    if (file.size > 10 * 1024 * 1024) return alert("Max 10 MB.");
    onChange(file, URL.createObjectURL(file));
  };

  return preview ? (
    <div className="relative rounded-xl overflow-hidden">
      <img src={preview} alt="preview" className="w-full object-cover rounded-xl" style={{ maxHeight: 260 }} />
      <button
        onClick={onClear}
        className="absolute top-2.5 right-2.5 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
      >
        <X size={12} />
      </button>
    </div>
  ) : (
    <>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files[0]); }}
        onClick={() => inputRef.current.click()}
        className={`rounded-xl border-2 border-dashed cursor-pointer py-10 text-center transition-all ${dragging ? "border-[#078DD4] bg-sky-50" : "border-slate-200 bg-slate-50 hover:border-[#078DD4] hover:bg-sky-50/40"}`}
      >
        <UploadCloud size={24} className="text-slate-300 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-500">Drop image or click to browse</p>
        <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP · max 10 MB</p>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handle(e.target.files[0])} />
    </>
  );
}

function Section({ icon: Icon, title, children, action }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <Icon size={16} className="text-slate-400" />
          <span className="text-sm font-semibold text-slate-800">{title}</span>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function ProjectForm({ initialData, projectId }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const isEdit = !!projectId;

  const [form, setForm] = useState(() => {
    if (initialData) {
      return {
        name: initialData.name || "",
        location: initialData.location || "",
        propertySize: initialData.propertySize || "",
        price: initialData.price || "",
        status: initialData.status || "Under Construction",
        category: initialData.category || "residential",
        overview: initialData.overview || "",
        reraNumber: initialData.reraNumber || "",
        reraUrl: initialData.reraUrl || "",
        aboutCity: initialData.aboutCity || { name: "", text: "" },
        aboutSector: initialData.aboutSector || { name: "", text: "" },
        documents: initialData.documents || [],
        isFeatured: initialData.isFeatured || false,
        isActive: initialData.isActive !== false,
        imageFile: null,
        imagePreview: initialData.image || "",
      };
    }
    return { ...EMPTY };
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const setNested = (key, subKey, val) => setForm((f) => ({ ...f, [key]: { ...f[key], [subKey]: val } }));

  const addDoc = () => set("documents", [...form.documents, { label: "", url: "" }]);
  const removeDoc = (i) => set("documents", form.documents.filter((_, idx) => idx !== i));
  const updateDoc = (i, field, val) =>
    set("documents", form.documents.map((d, idx) => idx === i ? { ...d, [field]: val } : d));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Project name is required";
    if (!form.location.trim()) e.location = "Location is required";
    if (!form.category) e.category = "Category is required";
    if (!isEdit && !form.imageFile) e.imageFile = "Cover image is required";
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
      fd.append("location", form.location.trim());
      fd.append("propertySize", (form.propertySize || "").trim());
      fd.append("price", (form.price || "").trim());
      fd.append("status", form.status);
      fd.append("category", form.category);
      fd.append("overview", form.overview || "");
      fd.append("reraNumber", (form.reraNumber || "").trim());
      fd.append("reraUrl", (form.reraUrl || "").trim());
      fd.append("isFeatured", form.isFeatured);
      fd.append("isActive", form.isActive);
      fd.append("aboutCity", JSON.stringify(form.aboutCity));
      fd.append("aboutSector", JSON.stringify(form.aboutSector));
      fd.append("documents", JSON.stringify(form.documents.filter((d) => d.label && d.url)));
      if (form.imageFile) fd.append("image", form.imageFile);

      const res = isEdit
        ? await dispatch(updateProject(projectId, fd, router))
        : await dispatch(createProject(fd, router));

      if (res?.status) router.push("/projects");
      else setApiError(res?.data?.message || res?.message || "Something went wrong.");
    } catch (err) {
      setApiError(err?.message || "Something went wrong.");
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen" style={{ background: "#f8fafc" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/projects")}
            className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{isEdit ? "Edit Project" : "Add Project"}</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {isEdit ? "Update project details" : "Fill in the details to list a new project"}
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Basic Info */}
          <Section icon={Building2} title="Basic Information">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className={LABEL_CLS}>Project Name *</label>
                <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Lotus Heights" className={`${FIELD_CLS} ${errors.name ? "border-red-300 bg-red-50" : ""}`} />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className={LABEL_CLS}>Location *</label>
                <input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Sector 150, Noida" className={`${FIELD_CLS} ${errors.location ? "border-red-300 bg-red-50" : ""}`} />
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
              </div>
              <div>
                <label className={LABEL_CLS}>Category *</label>
                <select value={form.category} onChange={(e) => set("category", e.target.value)} className={FIELD_CLS}>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
              <div>
                <label className={LABEL_CLS}>Status</label>
                <select value={form.status} onChange={(e) => set("status", e.target.value)} className={FIELD_CLS}>
                  <option value="Under Construction">Under Construction</option>
                  <option value="Ready to Move">Ready to Move</option>
                </select>
              </div>
              <div>
                <label className={LABEL_CLS}>Price</label>
                <input value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="e.g. 85 Lacs onwards" className={FIELD_CLS} />
              </div>
              <div>
                <label className={LABEL_CLS}>Property Size</label>
                <input value={form.propertySize} onChange={(e) => set("propertySize", e.target.value)} placeholder="e.g. 1200 sq.ft" className={FIELD_CLS} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Toggle value={form.isFeatured} onChange={(v) => set("isFeatured", v)} label="Featured" description="Show on homepage" />
              <Toggle value={form.isActive} onChange={(v) => set("isActive", v)} label="Active" description="Visible on website" />
            </div>
          </Section>

          {/* Cover Image */}
          <Section icon={ImageIcon} title="Cover Image">
            <UploadZone
              preview={form.imagePreview}
              onChange={(file, url) => setForm((f) => ({ ...f, imageFile: file, imagePreview: url }))}
              onClear={() => setForm((f) => ({ ...f, imageFile: null, imagePreview: "" }))}
            />
          </Section>

          {/* Overview */}
          <Section icon={AlignLeft} title="Overview">
            <RichEditor
              key={projectId || "new-project"}
              value={form.overview}
              onChange={(v) => set("overview", v)}
              height={220}
              toolbar="standard"
              placeholder="Describe this project — location highlights, amenities, pricing…"
            />
          </Section>

          {/* RERA */}
          <Section icon={Shield} title="RERA Details">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLS}>RERA Number</label>
                <input value={form.reraNumber} onChange={(e) => set("reraNumber", e.target.value)} placeholder="UPRERAPRJ12345" className={FIELD_CLS} />
              </div>
              <div>
                <label className={LABEL_CLS}>RERA Certificate URL</label>
                <input value={form.reraUrl} onChange={(e) => set("reraUrl", e.target.value)} placeholder="https://…" className={FIELD_CLS} />
              </div>
            </div>
          </Section>

          {/* About City */}
          <Section icon={MapPin} title="About the City">
            <div className="space-y-4">
              <div>
                <label className={LABEL_CLS}>City Name</label>
                <input value={form.aboutCity.name} onChange={(e) => setNested("aboutCity", "name", e.target.value)} placeholder="e.g. Noida" className={FIELD_CLS} />
              </div>
              <div>
                <label className={LABEL_CLS}>City Description</label>
                <RichEditor
                  key={`city-${projectId || "new"}`}
                  value={form.aboutCity.text}
                  onChange={(v) => setNested("aboutCity", "text", v)}
                  height={140}
                  toolbar="minimal"
                  placeholder="Write about the city…"
                />
              </div>
            </div>
          </Section>

          {/* About Sector */}
          <Section icon={MapPin} title="About the Sector">
            <div className="space-y-4">
              <div>
                <label className={LABEL_CLS}>Sector Name</label>
                <input value={form.aboutSector.name} onChange={(e) => setNested("aboutSector", "name", e.target.value)} placeholder="e.g. Sector 150" className={FIELD_CLS} />
              </div>
              <div>
                <label className={LABEL_CLS}>Sector Description</label>
                <RichEditor
                  key={`sector-${projectId || "new"}`}
                  value={form.aboutSector.text}
                  onChange={(v) => setNested("aboutSector", "text", v)}
                  height={140}
                  toolbar="minimal"
                  placeholder="Write about the sector…"
                />
              </div>
            </div>
          </Section>

          {/* Documents */}
          <Section
            icon={FolderOpen}
            title="Documents"
            action={
              <button
                onClick={addDoc}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                style={{ background: "#078DD4" }}
              >
                <Plus size={12} /> Add
              </button>
            }
          >
            {form.documents.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No documents. Click &quot;Add&quot; to attach brochures or floor plans.</p>
            ) : (
              <div className="space-y-3">
                {form.documents.map((doc, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <input value={doc.label} onChange={(e) => updateDoc(i, "label", e.target.value)} placeholder="Label (e.g. Brochure)" className={`${FIELD_CLS} flex-1`} />
                    <input value={doc.url} onChange={(e) => updateDoc(i, "url", e.target.value)} placeholder="URL (https://…)" className={`${FIELD_CLS} flex-2`} />
                    <button onClick={() => removeDoc(i)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* API error */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-medium">
              {apiError}
            </div>
          )}

          {/* Cover image error (shown near bottom for visibility) */}
          {errors.imageFile && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-medium">
              {errors.imageFile}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => router.push("/projects")}
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
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Project"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
