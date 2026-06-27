import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import isAuth from "@/components/isAuth";
import { Api, ApiFormData } from "@/services/service";
import {
  Save,
  Plus,
  Trash2,
  Star,
  Settings2,
  CheckCircle2,
  UploadCloud,
  X,
} from "lucide-react";
import RichEditor from "@/components/RichEditor";

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Toast({ msg, type }) {
  if (!msg) return null;
  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold shadow-xl transition-all ${
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
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60 transition-opacity"
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

function Field({ label, hint, required, children }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {label}
          {required && (
            <span className="text-red-400 normal-case font-normal ml-1">*</span>
          )}
        </label>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const INPUT =
  "w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#078DD4] focus:bg-white transition-all";

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

const WELCOME_SAMPLE = {
  heading: "Welcome to Lotusss",
  subheading: "Your Dream Home Awaits in Noida",
  description:
    "<p>At <strong>Lotusss Real Estate</strong>, we believe that a home is more than just four walls — it's where memories are made and lives are built.</p><p>With over 15 years of experience in the Noida real estate market, we have helped <strong>2,500+ families</strong> find their dream homes. Our projects combine world-class amenities with thoughtful design and transparent pricing.</p>",
  imageUrls: [
    "https://picsum.photos/seed/lotus-villa/800/560",
    "https://picsum.photos/seed/lotus-apt/800/560",
    "https://picsum.photos/seed/lotus-arch/800/560",
  ],
};

const WHY_SAMPLE = {
  heading: "Why Choose Lotusss",
  features: [
    {
      icon: "Shield",
      title: "Trusted Developer",
      description:
        "RERA registered with 100% transparency in all transactions and documentation.",
    },
    {
      icon: "MapPin",
      title: "Prime Locations",
      description:
        "Strategically located projects in Sector 150, 94, and 79 — Noida's fastest growing corridors.",
    },
    {
      icon: "CreditCard",
      title: "Flexible Payment Plans",
      description:
        "Easy EMI options, subvention schemes and zero pre-EMI plans to fit your budget.",
    },
    {
      icon: "Star",
      title: "World-Class Amenities",
      description:
        "Clubhouse, swimming pool, gym, kids' play area, and landscaped gardens in every project.",
    },
  ],
};

const TESTIMONIAL_SAMPLE = [
  {
    name: "Rahul Sharma",
    role: "Villa Owner, Lotus Heights",
    quote:
      "<p>We purchased a 3 BHK apartment and the entire experience was seamless. The team was responsive, the paperwork was transparent, and the quality of construction exceeded our expectations.</p>",
    rating: 5,
    image: "https://i.pravatar.cc/150?img=12",
  },
  {
    name: "Priya Gupta",
    role: "Investor, Lotus Avenue",
    quote:
      "<p>I've invested in two projects by Lotusss and both have given excellent returns. The location selection is strategic and the after-sales support is outstanding.</p>",
    rating: 5,
    image: "https://i.pravatar.cc/150?img=49",
  },
  {
    name: "Arvind Kumar",
    role: "Resident, Lotus Greens",
    quote:
      "<p>The amenities are top-notch and the community is wonderful. My children love the play area and we enjoy the clubhouse every weekend. Truly a 5-star living experience.</p>",
    rating: 4,
    image: "https://i.pravatar.cc/150?img=57",
  },
];

const FOOTER_SAMPLE = {
  description:
    "Lotusss Real Estate — Building premium residential and commercial spaces in Noida with a commitment to quality, transparency, and customer satisfaction.",
  phone: "+91 98765 43210",
  email: "info@lotusss.com",
  address: "Sector 94, Noida, Uttar Pradesh 201301",
  whatsapp: "919876543210",
  socialLinks: {
    instagram: "https://instagram.com/lotusssinfra",
    facebook: "https://facebook.com/lotusssinfra",
    twitter: "https://twitter.com/lotusssinfra",
  },
};

// ─── Welcome Tab ──────────────────────────────────────────────────────────────

function WelcomeTab({ data, onSaved, router }) {
  const [form, setForm] = useState({
    heading: "",
    subheading: "",
    description: "",
    ...data,
  });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState(data?.images || []);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    setForm({ heading: "", subheading: "", description: "", ...data });
    setPreviews(data?.images || []);
  }, [data]);

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files).slice(0, 3);
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  };

  const save = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("heading", form.heading);
      fd.append("subheading", form.subheading);
      fd.append("description", form.description);
      files.forEach((f) => fd.append("images", f));
      // If no files chosen but previews are remote URLs (sample data), send as imageUrls
      if (files.length === 0 && previews.length > 0 && previews.every((p) => !p.startsWith("blob:"))) {
        fd.append("imageUrls", JSON.stringify(previews));
      }
      const res = await ApiFormData("put", "site-settings/welcome", fd, router);
      if (res?.status) onSaved("Welcome section saved!");
      else onSaved(res?.message || "Failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const loadSample = () => {
    const { imageUrls, ...textFields } = WELCOME_SAMPLE;
    setForm(textFields);
    setPreviews(imageUrls);
    setFiles([]);
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <SampleBtn onClick={loadSample} />
      </div>

      <Field label="Heading" required>
        <input
          value={form.heading}
          onChange={(e) => setForm((f) => ({ ...f, heading: e.target.value }))}
          className={INPUT}
          placeholder="Welcome to Lotusss"
        />
      </Field>

      <Field label="Subheading">
        <input
          value={form.subheading}
          onChange={(e) =>
            setForm((f) => ({ ...f, subheading: e.target.value }))
          }
          className={INPUT}
          placeholder="Your dream home awaits"
        />
      </Field>

      <Field label="Description">
        <RichEditor
          key={data?.description?.slice(0, 20)}
          value={form.description}
          onChange={(v) => setForm((f) => ({ ...f, description: v }))}
          height={180}
          toolbar="standard"
          placeholder="Write about your company…"
        />
      </Field>

      <Field label="Gallery Images" hint="Max 3 images">
        {previews.length > 0 ? (
          <div className="flex gap-3 flex-wrap mb-3">
            {previews.map((src, i) => (
              <div
                key={i}
                className="relative w-28 h-20 rounded-xl overflow-hidden border border-slate-200 group"
              >
                <img
                  src={src}
                  className="w-full h-full object-cover"
                  alt={`img ${i + 1}`}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setFiles([]);
                setPreviews([]);
              }}
              className="w-28 h-20 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 hover:border-red-300 hover:text-red-400 transition-colors text-xs"
            >
              <X size={14} className="mr-1" /> Clear
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileRef.current.click()}
            className="flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-[#078DD4] hover:bg-sky-50/40 cursor-pointer transition-all mb-3"
          >
            <UploadCloud size={22} className="text-slate-300" />
            <p className="text-sm text-slate-500 font-medium">
              Click to upload images
            </p>
            <p className="text-xs text-slate-400">
              JPG, PNG, WebP · up to 3 files
            </p>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFiles}
        />
        {previews.length === 0 && (
          <p className="text-xs text-slate-400">
            Selecting new images replaces all existing ones
          </p>
        )}
      </Field>

      <SaveBtn onClick={save} saving={saving} />
    </div>
  );
}

// ─── Why Choose Us Tab ────────────────────────────────────────────────────────

function WhyChooseUsTab({ data, onSaved, router }) {
  const [heading, setHeading] = useState(data?.heading || "Why Choose Us");
  const [features, setFeatures] = useState(data?.features || []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setHeading(data?.heading || "Why Choose Us");
    setFeatures(data?.features || []);
  }, [data]);

  const update = (i, k, v) =>
    setFeatures((fs) => fs.map((f, idx) => (idx === i ? { ...f, [k]: v } : f)));
  const add = () =>
    setFeatures((fs) => [...fs, { icon: "", title: "", description: "" }]);
  const remove = (i) => setFeatures((fs) => fs.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    try {
      const res = await Api(
        "put",
        "site-settings/why-choose-us",
        { heading, features },
        router,
      );
      if (res?.status) onSaved("Why Choose Us saved!");
      else onSaved(res?.message || "Failed", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Field label="Section Heading">
          <input
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            className={INPUT}
            placeholder="Why Choose Us"
          />
        </Field>
        <SampleBtn
          onClick={() => {
            setHeading(WHY_SAMPLE.heading);
            setFeatures(WHY_SAMPLE.features);
          }}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Feature Cards ({features.length})
          </span>
          <button
            onClick={add}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
            style={{ background: "#078DD4" }}
          >
            <Plus size={12} /> Add Card
          </button>
        </div>

        {features.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 rounded-xl py-10 text-center">
            <Settings2 size={24} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400 font-medium">
              No feature cards yet
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Click "Add Card" to highlight your strengths
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {features.map((feat, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white"
                      style={{ background: "#078DD4" }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 truncate max-w-[200px]">
                      {feat.title || `Feature ${i + 1}`}
                    </span>
                  </div>
                  <button
                    onClick={() => remove(i)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">
                        Icon name
                      </label>
                      <input
                        value={feat.icon}
                        onChange={(e) => update(i, "icon", e.target.value)}
                        className={INPUT}
                        placeholder="Shield, MapPin, Star…"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">
                        Title
                      </label>
                      <input
                        value={feat.title}
                        onChange={(e) => update(i, "title", e.target.value)}
                        className={INPUT}
                        placeholder="Card title"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">
                      Description
                    </label>
                    <RichEditor
                      key={`feat-${i}-${data?.features?.[i]?.description?.slice(0, 10)}`}
                      value={feat.description}
                      onChange={(v) => update(i, "description", v)}
                      height={110}
                      toolbar="minimal"
                      placeholder="Brief feature description…"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SaveBtn onClick={save} saving={saving} />
    </div>
  );
}

// ─── Testimonials Tab ─────────────────────────────────────────────────────────

function TestimonialsTab({ data, onSaved, router }) {
  const [testimonials, setTestimonials] = useState(data || []);
  const [saving, setSaving] = useState(false);
  const fileRefs = useRef({});

  useEffect(() => setTestimonials(data || []), [data]);

  const update = (i, k, v) =>
    setTestimonials((ts) =>
      ts.map((t, idx) => (idx === i ? { ...t, [k]: v } : t)),
    );
  const add = () =>
    setTestimonials((ts) => [
      ...ts,
      { name: "", role: "", quote: "", image: "", rating: 5 },
    ]);
  const remove = (i) =>
    setTestimonials((ts) => ts.filter((_, idx) => idx !== i));

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
      const cleaned = testimonials.map(({ _file, _preview, ...t }) => t);
      fd.append("testimonials", JSON.stringify(cleaned));
      testimonials.forEach((t, i) => {
        if (t._file) fd.append(`image_${i}`, t._file);
      });
      const res = await ApiFormData(
        "put",
        "site-settings/testimonials",
        fd,
        router,
      );
      if (res?.status) onSaved("Testimonials saved!");
      else onSaved(res?.message || "Failed", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {testimonials.length} Testimonial
          {testimonials.length !== 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-2">
          <SampleBtn onClick={() => setTestimonials(TESTIMONIAL_SAMPLE)} />
          <button
            onClick={add}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
            style={{ background: "#078DD4" }}
          >
            <Plus size={12} /> Add
          </button>
        </div>
      </div>

      {testimonials.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-xl py-10 text-center">
          <Star size={24} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400 font-medium">
            No testimonials yet
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Add customer reviews to build trust
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#078DD4] text-white text-xs font-bold flex items-center justify-center">
                    {t.name ? t.name[0].toUpperCase() : i + 1}
                  </div>
                  <span className="text-xs font-semibold text-slate-600 truncate max-w-[180px]">
                    {t.name || `Testimonial ${i + 1}`}
                  </span>
                </div>
                <button
                  onClick={() => remove(i)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              <div className="p-4 space-y-3">
                {/* Person info row */}
                <div className="flex gap-3 items-start">
                  <div
                    className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 shrink-0 cursor-pointer border-2 border-transparent hover:border-[#078DD4] transition-all relative group"
                    onClick={() => fileRefs.current[i]?.click()}
                  >
                    {t._preview || t.image ? (
                      <img
                        src={t._preview || t.image}
                        className="w-full h-full object-cover"
                        alt="avatar"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                        <UploadCloud size={14} />
                        <span className="text-[9px] mt-0.5">Photo</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={(el) => (fileRefs.current[i] = el)}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImg(i, e)}
                  />
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      value={t.name}
                      onChange={(e) => update(i, "name", e.target.value)}
                      className={INPUT}
                      placeholder="Full name"
                    />
                    <input
                      value={t.role}
                      onChange={(e) => update(i, "role", e.target.value)}
                      className={INPUT}
                      placeholder="Role / Project"
                    />
                  </div>
                </div>

                {/* Quote */}
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">
                    Their review
                  </label>
                  <RichEditor
                    key={`quote-${i}-${data?.[i]?.quote?.slice(0, 10)}`}
                    value={t.quote}
                    onChange={(v) => update(i, "quote", v)}
                    height={110}
                    toolbar="minimal"
                    placeholder="Enter the testimonial quote…"
                  />
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 mr-1">Rating:</span>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => update(i, "rating", s)}
                    >
                      <Star
                        size={16}
                        className={
                          s <= (t.rating || 5)
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-200 fill-slate-200"
                        }
                      />
                    </button>
                  ))}
                  <span className="text-xs text-slate-400 ml-1">
                    {t.rating || 5}/5
                  </span>
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

// ─── Footer Tab ───────────────────────────────────────────────────────────────

function FooterTab({ data, onSaved, router }) {
  const blank = { description: "", phone: "", altPhone: "", email: "", website: "", address: "", addressLine2: "", whatsapp: "", socialLinks: { instagram: "", facebook: "", twitter: "" } };
  const [form, setForm] = useState({ ...blank, ...data, socialLinks: { ...blank.socialLinks, ...data?.socialLinks } });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({ ...blank, ...data, socialLinks: { ...blank.socialLinks, ...data?.socialLinks } });
  }, [data]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setSocial = (k, v) =>
    setForm((f) => ({ ...f, socialLinks: { ...f.socialLinks, [k]: v } }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await Api("put", "site-settings/footer", form, router);
      if (res?.status) onSaved("Footer saved!");
      else onSaved(res?.message || "Failed", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <SampleBtn
          onClick={() =>
            setForm({
              ...form,
              ...FOOTER_SAMPLE,
              socialLinks: { ...FOOTER_SAMPLE.socialLinks },
            })
          }
        />
      </div>

      <Field label="Company Description">
        <RichEditor
          key={data?.description?.slice(0, 20)}
          value={form.description}
          onChange={(v) => set("description", v)}
          height={120}
          toolbar="minimal"
          placeholder="Brief description shown in the footer…"
        />
      </Field>

      <div>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 block">
          Contact Details
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            ["phone", "Primary Phone", "+91 98765 43210"],
            ["altPhone", "Alternate Phone", "+91 98765 43211"],
            ["email", "Email Address", "info@lotusss.com"],
            ["website", "Website URL", "www.lotusssinfra.com"],
            ["whatsapp", "WhatsApp Number", "919876543210"],
            ["address", "Office Address", "Sector 94, Noida, UP"],
            ["addressLine2", "Address Line 2", "Noida Expressway, UP 201305"],
          ].map(([k, label, ph]) => (
            <div key={k}>
              <label className="text-xs text-slate-500 mb-1 block">{label}</label>
              <input value={form[k] || ""} onChange={(e) => set(k, e.target.value)} className={INPUT} placeholder={ph} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 block">
          Social Media Links
        </span>
        <div className="space-y-2.5">
          {[
            ["instagram", "Instagram URL"],
            ["facebook", "Facebook URL"],
            ["twitter", "Twitter / X URL"],
          ].map(([k, label]) => (
            <div key={k}>
              <label className="text-xs text-slate-500 mb-1 block">
                {label}
              </label>
              <input
                value={form.socialLinks[k]}
                onChange={(e) => setSocial(k, e.target.value)}
                className={INPUT}
                placeholder={`https://${k}.com/lotusssinfra`}
              />
            </div>
          ))}
        </div>
      </div>

      <SaveBtn onClick={save} saving={saving} />
    </div>
  );
}

// ─── General Tab (Logo, Stats, Contact Section Image) ─────────────────────────

function GeneralTab({ data, onSaved, router }) {
  const [logoUrl, setLogoUrl] = useState(data?.logo || "");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(data?.logo || "");
  const [contactImg, setContactImg] = useState(data?.contactSectionImage || "");
  const [stats, setStats] = useState(
    Array.isArray(data?.stats) && data.stats.length > 0
      ? data.stats
      : [{ value: "500+", label: "Units Delivered" }, { value: "15 Years", label: "Of Excellence" }, { value: "28 Cities", label: "National Footprint" }]
  );
  const [saving, setSaving] = useState(false);
  const logoRef = useRef();

  useEffect(() => {
    setLogoUrl(data?.logo || "");
    setLogoPreview(data?.logo || "");
    setContactImg(data?.contactSectionImage || "");
    if (Array.isArray(data?.stats) && data.stats.length > 0) setStats(data.stats);
  }, [data]);

  const handleLogoFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setLogoFile(f);
    setLogoPreview(URL.createObjectURL(f));
  };

  const updateStat = (i, field, val) => setStats((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  const addStat = () => setStats((prev) => [...prev, { value: "", label: "" }]);
  const removeStat = (i) => setStats((prev) => prev.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      if (logoFile) fd.append("logo", logoFile);
      else if (logoUrl) fd.append("logoUrl", logoUrl);
      fd.append("stats", JSON.stringify(stats));
      fd.append("contactSectionImageUrl", contactImg);
      const res = await ApiFormData("put", "site-settings/general", fd, router);
      if (res?.status) onSaved("General settings saved!");
      else onSaved(res?.message || "Failed", "error");
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      {/* Logo */}
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Site Logo</label>
        <div className="flex items-center gap-4 mb-3">
          {logoPreview && (
            <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-200 shrink-0">
              <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
            </div>
          )}
          <button onClick={() => logoRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:border-[#078DD4] hover:text-[#078DD4] transition-all">
            <UploadCloud size={15} /> Upload Logo
          </button>
          <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />
        </div>
        <Field label="Or paste logo URL">
          <input value={logoUrl} onChange={(e) => { setLogoUrl(e.target.value); setLogoPreview(e.target.value); setLogoFile(null); }} className={INPUT} placeholder="https://..." />
        </Field>
      </div>

      {/* Contact Section Image */}
      <Field label="Contact Section Image (home page right side)" hint="URL">
        <input value={contactImg} onChange={(e) => setContactImg(e.target.value)} className={INPUT} placeholder="https://..." />
        {contactImg && <img src={contactImg} alt="preview" className="mt-2 h-24 rounded-xl object-cover" />}
      </Field>

      {/* Stats */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Company Stats</label>
          <button onClick={addStat} className="flex items-center gap-1 text-xs font-semibold text-[#078DD4] hover:text-sky-700 transition-colors">
            <Plus size={13} /> Add Stat
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {stats.map((s, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input value={s.value} onChange={(e) => updateStat(i, "value", e.target.value)} className={INPUT + " w-36"} placeholder="500+" />
              <input value={s.label} onChange={(e) => updateStat(i, "label", e.target.value)} className={INPUT} placeholder="Units Delivered" />
              <button onClick={() => removeStat(i)} className="p-2 text-red-400 hover:text-red-600 shrink-0"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      </div>

      <SaveBtn onClick={save} saving={saving} />
    </div>
  );
}

// ─── Section Headings Tab ─────────────────────────────────────────────────────

function SectionHeadingsTab({ data, onSaved, router }) {
  const [form, setForm] = useState({
    ourProjects: "Our Projects",
    recentBlogs: "Recent Blogs",
    gallery: "Gallery",
    contactSection: "Partner With Us",
    leaders: "Our Leaders",
    ...data,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm((f) => ({ ...f, ...data }));
  }, [data]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await Api("put", "site-settings/section-headings", form, router);
      if (res?.status) onSaved("Section headings saved!");
      else onSaved(res?.message || "Failed", "error");
    } finally { setSaving(false); }
  };

  const fields = [
    { key: "ourProjects", label: "Our Projects (home)" },
    { key: "recentBlogs", label: "Recent Blogs (home)" },
    { key: "gallery", label: "Gallery (home)" },
    { key: "contactSection", label: "Contact Section (home)" },
    { key: "leaders", label: "Our Leaders (about page)" },
  ];

  return (
    <div className="space-y-4">
      {fields.map(({ key, label }) => (
        <Field key={key} label={label}>
          <input value={form[key] || ""} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} className={INPUT} />
        </Field>
      ))}
      <SaveBtn onClick={save} saving={saving} />
    </div>
  );
}

// ─── Page Banners Tab ─────────────────────────────────────────────────────────

const PAGE_BANNER_FIELDS = [
  { key: "projects", label: "Projects Page Banner" },
  { key: "blog", label: "Blog Page Banner" },
  { key: "gallery", label: "Gallery Page Banner" },
  { key: "contact", label: "Contact Page Banner" },
  { key: "privacyPolicy", label: "Privacy Policy Banner" },
  { key: "termsOfService", label: "Terms of Service Banner" },
];

function PageBannersTab({ data, onSaved, router }) {
  const [form, setForm] = useState({
    projects: "", blog: "", gallery: "", contact: "", privacyPolicy: "", termsOfService: "",
    ...data,
  });
  const [files, setFiles] = useState({});
  const [previews, setPreviews] = useState({});
  const [saving, setSaving] = useState(false);
  const fileRefs = useRef({});

  useEffect(() => {
    if (data) setForm((f) => ({ ...f, ...data }));
  }, [data]);

  const handleFile = (key, e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFiles((prev) => ({ ...prev, [key]: f }));
    setPreviews((prev) => ({ ...prev, [key]: URL.createObjectURL(f) }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      PAGE_BANNER_FIELDS.forEach(({ key }) => {
        if (files[key]) fd.append(key, files[key]);
        else fd.append(key + "Url", form[key] || "");
      });
      const res = await ApiFormData("put", "site-settings/page-banners", fd, router);
      if (res?.status) onSaved("Page banners saved!");
      else onSaved(res?.message || "Failed", "error");
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <p className="text-xs text-slate-400">Upload or paste an image URL for each page banner. Leave blank to use the default.</p>
      {PAGE_BANNER_FIELDS.map(({ key, label }) => {
        const preview = previews[key] || form[key];
        return (
          <Field key={key} label={label}>
            <div className="flex gap-2">
              <input
                value={form[key] || ""}
                onChange={(e) => { setForm((f) => ({ ...f, [key]: e.target.value })); setFiles((f) => ({ ...f, [key]: null })); setPreviews((f) => ({ ...f, [key]: null })); }}
                className={INPUT + " flex-1"}
                placeholder="https://..."
              />
              <button
                type="button"
                onClick={() => fileRefs.current[key]?.click()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:border-[#078DD4] hover:text-[#078DD4] transition-all shrink-0"
              >
                <UploadCloud size={13} /> Upload
              </button>
              <input
                ref={(el) => (fileRefs.current[key] = el)}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(key, e)}
              />
            </div>
            {files[key] && (
              <p className="text-[11px] text-emerald-600 mt-1 font-medium">Selected: {files[key].name}</p>
            )}
            {preview && <img src={preview} alt={label} className="mt-2 h-20 w-full object-cover rounded-xl" />}
          </Field>
        );
      })}
      <SaveBtn onClick={save} saving={saving} />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = ["Welcome", "Why Choose Us", "Testimonials", "Footer", "General", "Section Headings", "Page Banners"];

function SiteSettingsPage() {
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3000);
  };

  useEffect(() => {
    Api("get", "site-settings", "", router)
      .then((res) => {
        if (res?.status) setSettings(res.data?.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const tabData = [
    settings?.welcome,
    settings?.whyChooseUs,
    settings?.testimonials,
    settings?.footer,
    { logo: settings?.logo, stats: settings?.stats, contactSectionImage: settings?.contactSectionImage },
    settings?.sectionHeadings,
    settings?.pageBanners,
  ];
  const TabComponents = [
    WelcomeTab,
    WhyChooseUsTab,
    TestimonialsTab,
    FooterTab,
    GeneralTab,
    SectionHeadingsTab,
    PageBannersTab,
  ];
  const ActiveTab = TabComponents[tab];

  return (
    <>
      <Head>
        <title>Site Settings — Admin</title>
      </Head>
      <Toast {...toast} />

      <div className="min-h-screen" style={{ background: "#f8fafc" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          {/* Page header */}
          <div className="mb-7">
            <h1 className="text-xl font-bold text-slate-900">Site Settings</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Manage homepage section content — Welcome, Features, Testimonials
              and Footer
            </p>
          </div>

          {/* Tab navigation */}
          <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl overflow-x-auto">
            {TABS.map((t, i) => (
              <button
                key={t}
                onClick={() => setTab(i)}
                className={`flex-1 min-w-max px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                  tab === i
                    ? "bg-white text-[#078DD4] shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            {loading ? (
              <div className="flex justify-center py-16">
                <span className="w-8 h-8 border-2 border-[#078DD4]/20 border-t-[#078DD4] rounded-full animate-spin" />
              </div>
            ) : (
              <ActiveTab
                data={tabData[tab]}
                onSaved={showToast}
                router={router}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default isAuth(SiteSettingsPage);
