import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import isAuth from "@/components/isAuth";
import { Api, ApiFormData } from "@/services/service";
import { Save, Plus, Trash2, CheckCircle2, UploadCloud, Users } from "lucide-react";
import RichEditor from "@/components/RichEditor";

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Toast({ msg, type }) {
  if (!msg) return null;
  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold shadow-xl ${
        type === "error" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
      }`}
    >
      {type !== "error" && <CheckCircle2 size={15} />}
      {msg}
    </div>
  );
}

function SaveBtn({ onClick, saving }) {
  return (
    <div className="flex justify-end pt-2 border-t border-slate-100">
      <button
        onClick={onClick}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
        style={{ background: "#078DD4" }}
      >
        {saving ? (
          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Save size={14} />
        )}
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const INPUT = "w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#078DD4] focus:bg-white transition-all";

function SampleBtn({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs font-semibold text-slate-400 hover:text-[#078DD4] transition-colors px-2 py-1 rounded-lg hover:bg-sky-50"
    >
      Load sample
    </button>
  );
}

// ─── Sample data ──────────────────────────────────────────────────────────────

const HERO_SAMPLE = {
  heading: "Building Dreams, Creating Homes",
  subheading: "15 years of trust, quality, and delivering excellence in real estate",
};

const STORY_SAMPLE = {
  heading: "Our Story",
  description: "<p>Lotusss Real Estate was founded in 2008 with a single vision — to make homeownership a joyful, transparent, and fulfilling experience for every Indian family.</p><p>What began as a small boutique developer in Noida has grown into one of the region's most trusted real estate brands, with over <strong>25 completed projects</strong>, <strong>2,500+ happy families</strong>, and a pipeline of ambitious developments across the NCR region.</p><p>We believe that a home is not just a structure — it's a place where life unfolds, milestones are celebrated, and futures are built. This belief drives every design decision, every material choice, and every interaction with our customers.</p>",
  highlights: [
    { value: "2,500+", label: "Happy Families" },
    { value: "25+", label: "Completed Projects" },
    { value: "15", label: "Years of Excellence" },
    { value: "₹0", label: "Pending Complaints" },
  ],
  imageUrl: "https://picsum.photos/seed/lotus-office/800/560",
};

const COMMITMENTS_SAMPLE = [
  { icon: "Star", title: "Quality Construction", description: "We use only premium-grade materials and follow IS standards for every structure we build." },
  { icon: "Users", title: "Customer First", description: "Every decision we make is centered around the satisfaction and trust of our homebuyers." },
  { icon: "Clock", title: "On-Time Delivery", description: "We have an industry-leading record of delivering projects on or before committed timelines." },
  { icon: "Award", title: "Award-Winning Designs", description: "Recognised nationally for architectural innovation and sustainable building practices." },
];

const LEADERS_SAMPLE = [
  {
    name: "Rajiv Sharma",
    role: "Managing Director",
    description: "<p>Rajiv founded Lotusss in 2008 with a vision to redefine affordable luxury in Noida. With a background in civil engineering and an MBA from IIM Ahmedabad, he has steered the company through 25+ successful projects.</p><p>Under his leadership, Lotusss has received multiple national awards for quality construction and customer satisfaction.</p>",
    image: "https://i.pravatar.cc/300?img=60",
  },
  {
    name: "Priya Agarwal",
    role: "Chief Design Officer",
    description: "<p>Priya heads the design and architecture team at Lotusss. A graduate of the School of Planning and Architecture, Delhi, she brings a unique blend of functionality and aesthetics to every project.</p><p>Her design philosophy: <em>A home should breathe, not just stand.</em></p>",
    image: "https://i.pravatar.cc/300?img=47",
  },
];

// ─── Hero Tab ─────────────────────────────────────────────────────────────────

function HeroTab({ data, onSaved, router }) {
  const [form, setForm] = useState({ heading: "About Us", subheading: "", ...data });
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm({ heading: "About Us", subheading: "", ...data }), [data]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await Api("put", "about-page/hero", form, router);
      if (res?.status) onSaved("Hero section saved!");
      else onSaved(res?.message || "Failed", "error");
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <SampleBtn onClick={() => setForm(HERO_SAMPLE)} />
      </div>

      <Field label="Page Heading">
        <input
          value={form.heading}
          onChange={(e) => setForm((f) => ({ ...f, heading: e.target.value }))}
          className={INPUT}
          placeholder="About Us"
        />
      </Field>

      <Field label="Subheading">
        <input
          value={form.subheading}
          onChange={(e) => setForm((f) => ({ ...f, subheading: e.target.value }))}
          className={INPUT}
          placeholder="Building dreams, creating homes"
        />
      </Field>

      <SaveBtn onClick={save} saving={saving} />
    </div>
  );
}

// ─── Story Tab ────────────────────────────────────────────────────────────────

function StoryTab({ data, onSaved, router }) {
  const [form, setForm] = useState({ heading: "Our Story", description: "", highlights: [], ...data });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(data?.image || "");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    setForm({ heading: "Our Story", description: "", highlights: [], ...data });
    setPreview(data?.image || "");
  }, [data]);

  const updH = (i, k, v) =>
    setForm((f) => ({ ...f, highlights: f.highlights.map((h, idx) => (idx === i ? { ...h, [k]: v } : h)) }));
  const addH = () => setForm((f) => ({ ...f, highlights: [...f.highlights, { value: "", label: "" }] }));
  const removeH = (i) => setForm((f) => ({ ...f, highlights: f.highlights.filter((_, idx) => idx !== i) }));

  const save = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("heading", form.heading);
      fd.append("description", form.description);
      fd.append("highlights", JSON.stringify(form.highlights));
      if (file) fd.append("image", file);
      // Send URL directly when a sample/existing URL is set but no new file chosen
      else if (!file && preview && !preview.startsWith("blob:")) fd.append("imageUrl", preview);
      const res = await ApiFormData("put", "about-page/story", fd, router);
      if (res?.status) onSaved("Story section saved!");
      else onSaved(res?.message || "Failed", "error");
    } finally { setSaving(false); }
  };

  const loadStorySample = () => {
    const { imageUrl, ...fields } = STORY_SAMPLE;
    setForm((f) => ({ ...f, ...fields }));
    if (imageUrl) { setPreview(imageUrl); setFile(null); }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <SampleBtn onClick={loadStorySample} />
      </div>

      <Field label="Section Heading">
        <input
          value={form.heading}
          onChange={(e) => setForm((f) => ({ ...f, heading: e.target.value }))}
          className={INPUT}
          placeholder="Our Story"
        />
      </Field>

      <Field label="Story Content">
        <RichEditor
          key={data?.description?.slice(0, 20)}
          value={form.description}
          onChange={(v) => setForm((f) => ({ ...f, description: v }))}
          height={240}
          toolbar="standard"
          placeholder="Tell the story of your company…"
        />
      </Field>

      <Field label="Story Image">
        <div className="flex items-start gap-4">
          {preview ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 shrink-0" style={{ width: 120, height: 90 }}>
              <img src={preview} alt="story" className="w-full h-full object-cover" />
              <button
                onClick={() => { setFile(null); setPreview(""); }}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
              >
                <span className="text-[10px] font-bold">×</span>
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileRef.current.click()}
              className="w-28 h-20 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#078DD4] hover:bg-sky-50/40 transition-all shrink-0"
            >
              <UploadCloud size={16} className="text-slate-300" />
              <span className="text-[10px] text-slate-400">Upload</span>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files[0];
              if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
            }}
          />
          <div className="text-xs text-slate-400">
            <p className="font-medium text-slate-500 mb-0.5">Company / project photo</p>
            <p>Recommended: landscape, 16:9 ratio</p>
            <p>Formats: JPG, PNG, WebP</p>
          </div>
        </div>
      </Field>

      {/* Stats / Highlights */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Stats / Highlights</span>
          <button
            onClick={addH}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
            style={{ background: "#078DD4" }}
          >
            <Plus size={12} /> Add Stat
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {form.highlights.map((h, i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
              <input
                value={h.value}
                onChange={(e) => updH(i, "value", e.target.value)}
                className="w-20 border border-slate-200 bg-white rounded-lg px-2 py-1.5 text-sm text-slate-800 outline-none focus:border-[#078DD4] text-center font-bold"
                placeholder="500+"
              />
              <input
                value={h.label}
                onChange={(e) => updH(i, "label", e.target.value)}
                className="flex-1 border border-slate-200 bg-white rounded-lg px-2 py-1.5 text-sm text-slate-800 outline-none focus:border-[#078DD4]"
                placeholder="Happy Families"
              />
              <button onClick={() => removeH(i)} className="text-slate-300 hover:text-red-400 transition-colors shrink-0">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
        {form.highlights.length === 0 && (
          <p className="text-xs text-slate-400 py-2">No stats added. Click &quot;Add Stat&quot; to show key metrics.</p>
        )}
      </div>

      <SaveBtn onClick={save} saving={saving} />
    </div>
  );
}

// ─── Commitments Tab ──────────────────────────────────────────────────────────

function CommitmentsTab({ data, onSaved, router }) {
  const [commitments, setCommitments] = useState(data || []);
  const [saving, setSaving] = useState(false);

  useEffect(() => setCommitments(data || []), [data]);

  const update = (i, k, v) => setCommitments((cs) => cs.map((c, idx) => (idx === i ? { ...c, [k]: v } : c)));
  const add = () => setCommitments((cs) => [...cs, { icon: "", title: "", description: "" }]);
  const remove = (i) => setCommitments((cs) => cs.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    try {
      const res = await Api("put", "about-page/commitments", { commitments }, router);
      if (res?.status) onSaved("Commitments saved!");
      else onSaved(res?.message || "Failed", "error");
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {commitments.length} Commitment{commitments.length !== 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-2">
          <SampleBtn onClick={() => setCommitments(COMMITMENTS_SAMPLE)} />
          <button
            onClick={add}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
            style={{ background: "#078DD4" }}
          >
            <Plus size={12} /> Add
          </button>
        </div>
      </div>

      {commitments.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-xl py-10 text-center">
          <CheckCircle2 size={24} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400 font-medium">No commitments yet</p>
          <p className="text-xs text-slate-400 mt-1">These appear in the "We are committed to" section</p>
        </div>
      ) : (
        <div className="space-y-3">
          {commitments.map((c, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white" style={{ background: "#078DD4" }}>
                    {i + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-600 truncate max-w-[200px]">
                    {c.title || `Commitment ${i + 1}`}
                  </span>
                </div>
                <button onClick={() => remove(i)} className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Icon name</label>
                    <input
                      value={c.icon}
                      onChange={(e) => update(i, "icon", e.target.value)}
                      className={INPUT}
                      placeholder="Star, Users, Clock, Award…"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Title</label>
                    <input
                      value={c.title}
                      onChange={(e) => update(i, "title", e.target.value)}
                      className={INPUT}
                      placeholder="Commitment title"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Description</label>
                  <RichEditor
                    key={`comm-${i}-${data?.[i]?.description?.slice(0,10)}`}
                    value={c.description}
                    onChange={(v) => update(i, "description", v)}
                    height={110}
                    toolbar="minimal"
                    placeholder="Brief commitment description…"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <SaveBtn onClick={save} saving={saving} />
    </div>
  );
}

// ─── Leaders Tab ──────────────────────────────────────────────────────────────

function LeadersTab({ data, onSaved, router }) {
  const [leaders, setLeaders] = useState(data || []);
  const [saving, setSaving] = useState(false);
  const fileRefs = useRef({});

  useEffect(() => setLeaders(data || []), [data]);

  const update = (i, k, v) => setLeaders((ls) => ls.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)));
  const add = () => setLeaders((ls) => [...ls, { name: "", role: "", description: "", image: "" }]);
  const remove = (i) => setLeaders((ls) => ls.filter((_, idx) => idx !== i));
  const handleImg = (i, e) => {
    const f = e.target.files[0];
    if (!f) return;
    update(i, "_file", f);
    update(i, "_preview", URL.createObjectURL(f));
  };

  const save = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      const cleaned = leaders.map(({ _file, _preview, ...l }) => l);
      fd.append("leaders", JSON.stringify(cleaned));
      leaders.forEach((l, i) => { if (l._file) fd.append(`image_${i}`, l._file); });
      const res = await ApiFormData("put", "about-page/leaders", fd, router);
      if (res?.status) onSaved("Leaders saved!");
      else onSaved(res?.message || "Failed", "error");
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {leaders.length} Leader{leaders.length !== 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-2">
          <SampleBtn onClick={() => setLeaders(LEADERS_SAMPLE)} />
          <button
            onClick={add}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
            style={{ background: "#078DD4" }}
          >
            <Plus size={12} /> Add Leader
          </button>
        </div>
      </div>

      {leaders.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-xl py-10 text-center">
          <Users size={24} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400 font-medium">No leaders added yet</p>
          <p className="text-xs text-slate-400 mt-1">Showcase your leadership team on the About page</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leaders.map((l, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              {/* Card header */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#078DD4] text-white text-xs font-bold flex items-center justify-center">
                    {l.name ? l.name[0].toUpperCase() : (i + 1)}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-700">{l.name || `Leader ${i + 1}`}</span>
                    {l.role && <span className="text-xs text-slate-400 ml-1.5">· {l.role}</span>}
                  </div>
                </div>
                <button onClick={() => remove(i)} className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>

              <div className="p-4 space-y-3">
                {/* Photo + name/role */}
                <div className="flex gap-4 items-start">
                  <div
                    className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 cursor-pointer border-2 border-transparent hover:border-[#078DD4] transition-all"
                    onClick={() => fileRefs.current[i]?.click()}
                  >
                    {(l._preview || l.image) ? (
                      <img src={l._preview || l.image} className="w-full h-full object-cover object-top" alt={l.name} />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-1">
                        <UploadCloud size={14} />
                        <span className="text-[9px]">Photo</span>
                      </div>
                    )}
                  </div>
                  <input ref={(el) => (fileRefs.current[i] = el)} type="file" accept="image/*" className="hidden" onChange={(e) => handleImg(i, e)} />
                  <div className="flex-1 space-y-2">
                    <input
                      value={l.name}
                      onChange={(e) => update(i, "name", e.target.value)}
                      className={INPUT}
                      placeholder="Full name"
                    />
                    <input
                      value={l.role}
                      onChange={(e) => update(i, "role", e.target.value)}
                      className={INPUT}
                      placeholder="Role / Designation"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Bio / Description</label>
                  <RichEditor
                    key={`leader-${i}-${data?.[i]?.description?.slice(0,10)}`}
                    value={l.description}
                    onChange={(v) => update(i, "description", v)}
                    height={160}
                    toolbar="standard"
                    placeholder="Write a brief bio for this leader…"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <SaveBtn onClick={save} saving={saving} />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = ["Hero", "Our Story", "Commitments", "Leaders"];

function AboutPageAdmin() {
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3000);
  };

  useEffect(() => {
    Api("get", "about-page", "", router)
      .then((res) => { if (res?.status) setData(res.data?.data); })
      .finally(() => setLoading(false));
  }, []);

  const tabData = [data?.hero, data?.story, data?.commitments, data?.leaders];
  const TabComponents = [HeroTab, StoryTab, CommitmentsTab, LeadersTab];
  const ActiveTab = TabComponents[tab];

  return (
    <>
      <Head><title>About Page — Admin</title></Head>
      <Toast {...toast} />

      <div className="min-h-screen" style={{ background: "#f8fafc" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="mb-7">
            <h1 className="text-xl font-bold text-slate-900">About Page</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Manage all content for the About Us page
            </p>
          </div>

          <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl overflow-x-auto">
            {TABS.map((t, i) => (
              <button
                key={t}
                onClick={() => setTab(i)}
                className={`flex-1 min-w-max px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                  tab === i ? "bg-white text-[#078DD4] shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            {loading ? (
              <div className="flex justify-center py-16">
                <span className="w-8 h-8 border-2 border-[#078DD4]/20 border-t-[#078DD4] rounded-full animate-spin" />
              </div>
            ) : (
              <ActiveTab data={tabData[tab]} onSaved={showToast} router={router} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default isAuth(AboutPageAdmin);
