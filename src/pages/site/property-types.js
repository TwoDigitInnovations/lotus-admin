import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import isAuth from "@/components/isAuth";
import { Api, ApiFormData } from "@/services/service";
import {
  Plus,
  Trash2,
  Pencil,
  Save,
  X,
  CheckCircle2,
  LayoutGrid,
} from "lucide-react";

function Toast({ msg, type }) {
  if (!msg) return null;
  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold shadow-xl ${type === "error" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"}`}
    >
      {type !== "error" && <CheckCircle2 size={15} />}
      {msg}
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
        <h3 className="text-base font-bold text-slate-900 mb-1">
          Delete property type?
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          This action cannot be undone.
        </p>
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

const EMPTY_FORM = { label: "", imageUrl: "", order: 0 };

function ItemForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initial?.image || "");
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setErrors((e) => ({ ...e, media: "" }));
  };

  const handleSave = () => {
    const errs = {};
    if (!form.label.trim()) errs.label = "Label is required";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSave(form, file);
  };

  const INPUT =
    "w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#078DD4] focus:bg-white transition-all";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
      <h3 className="text-sm font-bold text-slate-800">
        {initial ? "Edit Property Type" : "Add Property Type"}
      </h3>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
          Label *
        </label>
        <input
          value={form.label}
          onChange={(e) => set("label", e.target.value.toUpperCase())}
          className={`${INPUT} ${errors.label ? "border-red-300 bg-red-50" : ""}`}
          placeholder="e.g. RESIDENTIAL"
        />
        {errors.label && (
          <p className="text-red-500 text-xs mt-1">{errors.label}</p>
        )}
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
          Image
        </label>
        {preview && (
          <div
            className="relative w-full rounded-xl overflow-hidden mb-2"
            style={{ height: 160 }}
          >
            <img
              src={preview}
              alt="preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <label className="flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border border-dashed border-slate-300 text-sm text-slate-500 hover:border-[#078DD4] hover:text-[#078DD4] transition-colors">
          <Plus size={14} />
          {file ? file.name : "Upload image"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
        </label>
        {!file && (
          <div className="mt-2">
            <input
              value={form.imageUrl}
              onChange={(e) => {
                set("imageUrl", e.target.value);
                setPreview(e.target.value);
              }}
              className={INPUT}
              placeholder="Or paste image URL…"
            />
          </div>
        )}
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
          Display Order
        </label>
        <input
          type="number"
          value={form.order}
          onChange={(e) => set("order", e.target.value)}
          className={INPUT}
          placeholder="0"
          min="0"
        />
      </div>

      <div className="flex gap-3 pt-2 border-t border-slate-100">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <X size={14} className="inline mr-1.5" />
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2 transition-opacity"
          style={{ background: "#078DD4" }}
        >
          {saving && (
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          <Save size={14} />
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

function PropertyTypePage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3000);
  };

  const load = () => {
    setLoading(true);
    Api("get", "property-types/admin/all", "", router)
      .then((res) => {
        if (res?.status) setItems(res.data?.data || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (form, file) => {
    setSaving(true);
    try {
      const method = editItem ? "put" : "post";
      const url = editItem ? `property-types/${editItem._id}` : "property-types";
      let res;

      if (file) {
        const fd = new FormData();
        fd.append("label", form.label.trim());
        fd.append("order", form.order);
        fd.append("image", file);
        if (editItem)
          fd.append("isActive", editItem.isActive !== false ? "true" : "false");
        res = await ApiFormData(method, url, fd, router);
      } else {
        const payload = { label: form.label.trim(), order: form.order };
        if (form.imageUrl) payload.imageUrl = form.imageUrl;
        if (editItem) payload.isActive = editItem.isActive !== false;
        res = await Api(method, url, payload, router);
      }

      if (res?.status) {
        showToast(editItem ? "Updated!" : "Created!");
        load();
        setShowForm(false);
        setEditItem(null);
      } else {
        showToast(res?.message || "Failed to save", "error");
      }
    } catch (err) {
      showToast(err?.message || "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (item) => {
    try {
      const res = await Api("put", `property-types/${item._id}`, { isActive: !item.isActive }, router);
      if (res?.status) load();
      else showToast(res?.message || "Failed to toggle", "error");
    } catch (err) {
      showToast(err?.message || "Failed to toggle", "error");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await Api("delete", `property-types/${deleteTarget._id}`, {}, router);
      if (res?.status) {
        showToast("Deleted!");
        load();
      } else showToast(res?.message || "Failed to delete", "error");
    } catch (err) {
      showToast(err?.message || "Failed to delete", "error");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <Head>
        <title>Property Types — Admin</title>
      </Head>
      <Toast {...toast} />
      {deleteTarget && (
        <DeleteModal
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}

      <div className="min-h-screen" style={{ background: "#f8fafc" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-7">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Property Types
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Manage the property type cards shown on the home page
              </p>
            </div>
            {!showForm && !editItem && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
                style={{ background: "#078DD4" }}
              >
                <Plus size={15} /> Add Type
              </button>
            )}
          </div>

          {/* Add form */}
          {showForm && !editItem && (
            <div className="mb-6">
              <ItemForm
                onSave={handleSave}
                onCancel={() => setShowForm(false)}
                saving={saving}
              />
            </div>
          )}

          {/* Edit form */}
          {editItem && (
            <div className="mb-6">
              <ItemForm
                initial={{
                  label: editItem.label,
                  imageUrl: editItem.image,
                  order: editItem.order,
                  image: editItem.image,
                }}
                onSave={handleSave}
                onCancel={() => setEditItem(null)}
                saving={saving}
              />
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <span className="w-8 h-8 border-2 border-[#078DD4]/20 border-t-[#078DD4] rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <LayoutGrid size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm font-medium">
                No property types yet
              </p>
              <p className="text-slate-400 text-xs mt-1">
                Click "Add Type" to create the first one
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {items.map((item) => (
                <div
                  key={item._id}
                  className={`bg-white border rounded-2xl overflow-hidden transition-opacity ${item.isActive ? "border-slate-200" : "border-slate-100 opacity-50"}`}
                >
                  <div className="relative w-full" style={{ height: 160 }}>
                    <img
                      src={item.image}
                      alt={item.label}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ background: "rgba(0,0,0,0.35)" }}
                    >
                      <span className="text-white text-sm font-semibold tracking-widest border border-white/60 rounded-xl px-3 py-1.5">
                        {item.label}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-400">
                      Order: {item.order}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggle(item)}
                        title={item.isActive ? "Deactivate" : "Activate"}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${item.isActive ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}
                      >
                        {item.isActive ? "ON" : "OFF"}
                      </button>
                      <button
                        onClick={() => {
                          setEditItem(item);
                          setShowForm(false);
                        }}
                        className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 flex items-center justify-center transition-colors"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default isAuth(PropertyTypePage);
