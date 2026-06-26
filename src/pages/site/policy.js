import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import isAuth from "@/components/isAuth";
import { Api } from "@/services/service";
import { Save, FileText, Shield, CheckCircle2 } from "lucide-react";
import RichEditor from "@/components/RichEditor";

const PRIVACY_SAMPLE = `<h2>Privacy Policy</h2>
<p>At Lotusss Real Estate, we are committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information.</p>

<h3>Information We Collect</h3>
<p>We collect information you provide when you fill out contact forms, make enquiries, or subscribe to our newsletter. This includes your name, phone number, email address, and any messages you submit.</p>

<h3>How We Use Your Information</h3>
<p>We use collected information to:</p>
<ul>
  <li>Respond to your enquiries and provide project details</li>
  <li>Schedule site visits and keep you informed about new launches</li>
  <li>Improve our website's performance and user experience</li>
  <li>Send marketing communications where you have consented</li>
</ul>

<h3>Data Security</h3>
<p>We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, alteration, or destruction. All data transmission on our website is encrypted using SSL technology.</p>

<h3>Contact Us</h3>
<p>If you have questions about this Privacy Policy, please contact us at <strong>info@lotusss.com</strong> or call <strong>+91 9876543210</strong>.</p>`;

const TERMS_SAMPLE = `<h2>Terms of Service</h2>
<p>By accessing or using the Lotusss website, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>

<h3>Use of Website</h3>
<p>You may use our website solely for lawful purposes. You agree not to:</p>
<ul>
  <li>Transmit any unsolicited or unauthorised advertising material</li>
  <li>Attempt to gain unauthorised access to any part of the website</li>
  <li>Engage in any conduct that restricts or inhibits others' use of the site</li>
</ul>

<h3>Property Information & Accuracy</h3>
<p>All property details, pricing, floor plans, and images displayed on this website are for informational purposes only. Prices and availability are subject to change without notice. Final transaction details are governed solely by the legally executed sale agreement.</p>

<h3>Intellectual Property</h3>
<p>All content on this website — including text, images, graphics, logos, and video walkthroughs — is the exclusive property of Lotusss and is protected under applicable intellectual property laws.</p>

<h3>Governing Law</h3>
<p>These Terms shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts located in Gautam Buddh Nagar, Uttar Pradesh.</p>`;

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

const TAB_META = [
  { label: "Privacy Policy", icon: Shield, endpoint: "site-settings/privacy-policy", key: "privacyPolicy", sample: PRIVACY_SAMPLE },
  { label: "Terms of Service", icon: FileText, endpoint: "site-settings/terms", key: "termsOfService", sample: TERMS_SAMPLE },
];

function PolicyEditor({ content, onSave, saving, sample }) {
  const [text, setText] = useState(content || "");

  useEffect(() => setText(content || ""), [content]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 mt-0.5">Rich HTML content is rendered directly on the website</p>
        </div>
        <button
          type="button"
          onClick={() => setText(sample)}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-dashed border-slate-300 text-slate-500 hover:border-[#078DD4] hover:text-[#078DD4] transition-colors"
        >
          Load sample
        </button>
      </div>

      <RichEditor
        key={content?.slice(0, 40)}
        value={text}
        onChange={setText}
        height={460}
        toolbar="full"
        placeholder="Enter full policy content here…"
      />

      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-slate-400">Supports bold, headings, lists and links</p>
        <button
          onClick={() => onSave(text)}
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
    </div>
  );
}

function PolicyPage() {
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3000);
  };

  useEffect(() => {
    Api("get", "site-settings", "", router)
      .then((res) => { if (res?.status) setSettings(res.data?.data); })
      .finally(() => setLoading(false));
  }, []);

  const save = async (content) => {
    setSaving(true);
    const { endpoint, key, label } = TAB_META[tab];
    try {
      const res = await Api("put", endpoint, { content }, router);
      if (res?.status) {
        setSettings((s) => ({ ...s, [key]: content }));
        showToast(`${label} saved!`);
      } else {
        showToast(res?.message || "Failed to save", "error");
      }
    } finally { setSaving(false); }
  };

  const active = TAB_META[tab];
  const content = settings?.[active.key];

  return (
    <>
      <Head><title>Policy Pages — Admin</title></Head>
      <Toast {...toast} />

      <div className="min-h-screen" style={{ background: "#f8fafc" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          {/* Header */}
          <div className="mb-7">
            <h1 className="text-xl font-bold text-slate-900">Policy Pages</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Manage Privacy Policy and Terms of Service content
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl">
            {TAB_META.map(({ label, icon: Icon }, i) => (
              <button
                key={label}
                onClick={() => setTab(i)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === i
                    ? "bg-white text-[#078DD4] shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            {loading ? (
              <div className="flex justify-center py-16">
                <span className="w-8 h-8 border-2 border-[#078DD4]/20 border-t-[#078DD4] rounded-full animate-spin" />
              </div>
            ) : (
              <PolicyEditor
                key={tab}
                content={content}
                onSave={save}
                saving={saving}
                sample={active.sample}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default isAuth(PolicyPage);
