import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import isAuth from "@/components/isAuth";
import { Api } from "@/services/service";
import {
  MessageSquare, Building2, FileText, Image,
  ArrowUpRight, Star, MapPin, Phone,
  CheckCircle2, Clock, MailOpen, Home, Briefcase,
  HardHat, MoveRight, BookOpen, Globe, LayoutDashboard,
} from "lucide-react";

const CONTACT_STATUS = {
  new: { label: "New", bg: "#e0f2fe", color: "#078DD4" },
  read: { label: "Read", bg: "#f1f5f9", color: "#475569" },
  replied: { label: "Replied", bg: "#e8eef5", color: "#0d1f35" },
};

function StatCard({ icon: Icon, label, value, sub, color, href }) {
  const card = (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start justify-between gap-3 hover:shadow-md transition-shadow">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-3xl font-bold text-slate-900">{value ?? "—"}</p>
        {sub && <p className="text-xs text-slate-400 mt-1.5">{sub}</p>}
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: color + "18" }}>
          <Icon size={18} style={{ color }} />
        </div>
        {href && <ArrowUpRight size={14} className="text-slate-300" />}
      </div>
    </div>
  );
  return href ? <Link href={href}>{card}</Link> : card;
}

function MiniStat({ label, value, icon: Icon, color }) {
  return (
    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: color + "20" }}>
        <Icon size={15} style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-bold text-slate-800">{value ?? 0}</p>
      </div>
    </div>
  );
}

function SectionHeader({ title, href, linkLabel }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-bold text-slate-800">{title}</h2>
      {href && (
        <Link href={href} className="text-xs font-semibold flex items-center gap-1 hover:underline" style={{ color: "#078DD4" }}>
          {linkLabel || "View all"} <ArrowUpRight size={12} />
        </Link>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const s = CONTACT_STATUS[status] || { label: status, bg: "#f3f4f6", color: "#6b7280" };
  return (
    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold capitalize" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function Skeleton({ h = "h-8", w = "w-full" }) {
  return <div className={`${h} ${w} bg-slate-100 rounded-lg animate-pulse`} />;
}

function Dashboard() {
  const router = useRouter();
  const { user } = useSelector((s) => s.user);
  const name = user?.fullname || user?.name || "Admin";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Api("get", "dashboard/stats", "", router)
      .then((res) => {
        if (res?.status) setData(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};
  const contacts = stats.contacts || {};
  const blogs = stats.blogs || {};
  const gallery = stats.gallery || {};
  const projects = stats.projects || {};
  const recentContacts = data?.recentContacts || [];
  const recentBlogs = data?.recentBlogs || [];
  const recentProjects = data?.recentProjects || [];

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <Head><title>Dashboard | Lotusss Admin</title></Head>
      <div className="min-h-screen" style={{ background: "#f8fafc" }}>
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#078DD418" }}>
                  <LayoutDashboard size={16} style={{ color: "#078DD4" }} />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
              </div>
              <p className="text-sm text-slate-400">Welcome back, <span className="font-semibold text-slate-600">{name.split(" ")[0]}</span> &middot; {today}</p>
            </div>
          </div>

          {/* Primary Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                  <Skeleton h="h-4" w="w-24" />
                  <Skeleton h="h-8" w="w-16" />
                  <Skeleton h="h-3" w="w-32" />
                </div>
              ))
            ) : (
              <>
                <StatCard
                  icon={MessageSquare}
                  label="Contacts"
                  value={contacts.total}
                  sub={contacts.new ? `${contacts.new} new unread` : "All caught up"}
                  color="#078DD4"
                  href="/contacts"
                />
                <StatCard
                  icon={Building2}
                  label="Projects"
                  value={projects.total}
                  sub={`${projects.active ?? 0} active · ${projects.featured ?? 0} featured`}
                  color="#0d1f35"
                  href="/projects"
                />
                <StatCard
                  icon={FileText}
                  label="Blog Posts"
                  value={blogs.total}
                  sub={`${blogs.published ?? 0} published · ${blogs.drafts ?? 0} drafts`}
                  color="#078DD4"
                  href="/blogs"
                />
                <StatCard
                  icon={Image}
                  label="Gallery"
                  value={gallery.total}
                  sub={`${gallery.photos ?? 0} photos · ${gallery.videos ?? 0} videos`}
                  color="#0d1f35"
                  href="/gallery"
                />
              </>
            )}
          </div>

          {/* Projects Breakdown */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <SectionHeader title="Projects Breakdown" href="/projects" />
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h="h-16" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MiniStat label="Residential" value={projects.residential} icon={Home} color="#0d1f35" />
                <MiniStat label="Commercial" value={projects.commercial} icon={Briefcase} color="#078DD4" />
                <MiniStat label="Under Construction" value={projects.underConstruction} icon={HardHat} color="#0d1f35" />
                <MiniStat label="Ready to Move" value={projects.readyToMove} icon={MoveRight} color="#078DD4" />
              </div>
            )}
          </div>

          {/* Recent Contacts */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <SectionHeader title="Recent Contacts" href="/contacts" />
            </div>
            {loading ? (
              <div className="p-5 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h="h-10" />)}
              </div>
            ) : recentContacts.length === 0 ? (
              <div className="py-12 text-center">
                <MessageSquare size={24} className="text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No contacts yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Name</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Phone</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden md:table-cell">Subject</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden sm:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentContacts.map((c, i) => (
                      <tr key={c._id || i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3 font-semibold text-slate-800">{c.name}</td>
                        <td className="px-5 py-3 text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Phone size={11} className="text-slate-300 shrink-0" />
                            {c.phone}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-slate-500 hidden md:table-cell max-w-50 truncate">{c.subject || "—"}</td>
                        <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                        <td className="px-5 py-3 text-xs text-slate-400 hidden sm:table-cell">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Blogs + Recent Projects */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Recent Blog Posts */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <SectionHeader title="Recent Blog Posts" href="/blogs" />
              </div>
              {loading ? (
                <div className="p-5 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h="h-14" />)}
                </div>
              ) : recentBlogs.length === 0 ? (
                <div className="py-12 text-center">
                  <FileText size={24} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No posts yet</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {recentBlogs.map((b, i) => (
                    <div key={b._id || i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                        {b.image
                          ? <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><BookOpen size={14} className="text-slate-300" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{b.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {b.createdAt ? new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                        </p>
                      </div>
                      <span
                        className="px-2 py-0.5 rounded-md text-[11px] font-semibold shrink-0"
                        style={b.isPublished
                          ? { background: "#e0f2fe", color: "#078DD4" }
                          : { background: "#f1f5f9", color: "#475569" }}
                      >
                        {b.isPublished ? <span className="flex items-center gap-1"><Globe size={9} /> Live</span> : "Draft"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Projects */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <SectionHeader title="Recent Projects" href="/projects" />
              </div>
              {loading ? (
                <div className="p-5 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h="h-14" />)}
                </div>
              ) : recentProjects.length === 0 ? (
                <div className="py-12 text-center">
                  <Building2 size={24} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No projects yet</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {recentProjects.map((p, i) => (
                    <div key={p._id || i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                        {p.image
                          ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><Building2 size={14} className="text-slate-300" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                          {p.isFeatured && <Star size={11} className="text-amber-400 shrink-0 fill-amber-400" />}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                          <MapPin size={10} className="shrink-0" />
                          <span className="truncate">{p.location}</span>
                        </div>
                      </div>
                      <span
                        className="px-2 py-0.5 rounded-md text-[11px] font-semibold shrink-0"
                        style={p.status === "Ready to Move"
                          ? { background: "#e0f2fe", color: "#078DD4" }
                          : { background: "#f1f5f9", color: "#475569" }}
                      >
                        {p.status === "Ready to Move" ? "Ready" : "U.C."}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Add Project", href: "/projects/add", icon: Building2, color: "#0d1f35" },
                { label: "New Blog Post", href: "/blogs/add", icon: FileText, color: "#078DD4" },
                { label: "Upload to Gallery", href: "/gallery/add", icon: Image, color: "#0d1f35" },
                { label: "View Contacts", href: "/contacts", icon: MessageSquare, color: "#078DD4" },
              ].map((q) => (
                <Link key={q.href} href={q.href}>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:border-[#078DD4] hover:shadow-sm transition-all group cursor-pointer">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: q.color + "18" }}>
                      <q.icon size={15} style={{ color: q.color }} />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">{q.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default isAuth(Dashboard);
