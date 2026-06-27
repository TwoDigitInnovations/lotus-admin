import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import isAuth from "@/components/isAuth";
import { fetchProjects, deleteProject } from "@/redux/actions/projectActions";
import { Plus, Pencil, Trash2, Building2, MapPin, Star, LayoutGrid } from "lucide-react";

const STATUS_COLOR = {
  "Under Construction": { bg: "#f1f5f9", color: "#475569" },
  "Ready to Move": { bg: "#e0f2fe", color: "#078DD4" },
};
const CAT_COLOR = {
  residential: { bg: "#e8eef5", color: "#0d1f35" },
  commercial: { bg: "#e0f2fe", color: "#078DD4" },
};

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color + "18" }}>
        <Icon size={18} style={{ color }} />
      </div>
    </div>
  );
}

function DeleteModal({ project, onClose, onConfirm, deleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
        <div className="w-11 h-11 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 size={20} className="text-red-500" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">Delete project?</h3>
        <p className="text-sm text-slate-500 mb-1 font-medium">&quot;{project?.name}&quot;</p>
        <p className="text-xs text-slate-400 mb-6">This action cannot be undone.</p>
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
            {deleting && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project, onDelete }) {
  const sc = STATUS_COLOR[project.status] || { bg: "#f3f4f6", color: "#6b7280" };
  const cc = CAT_COLOR[project.category] || { bg: "#f3f4f6", color: "#6b7280" };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="relative bg-slate-100 overflow-hidden" style={{ height: 176 }}>
        {project.image
          ? <img src={project.image} alt={project.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center">
              <Building2 size={32} className="text-slate-300" />
            </div>}

        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold capitalize" style={{ background: cc.bg, color: cc.color }}>
            {project.category}
          </span>
          {project.isFeatured && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1" style={{ background: "#e8eef5", color: "#0d1f35" }}>
              <Star size={9} /> Featured
            </span>
          )}
        </div>

        {!project.isActive && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-xs font-semibold bg-black/40 px-3 py-1 rounded-full">Inactive</span>
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col gap-1.5">
        <p className="text-sm font-bold text-slate-900">{project.name}</p>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <MapPin size={11} className="shrink-0" />
          {project.location}
        </div>
        <span className="w-fit px-2 py-0.5 rounded-md text-[11px] font-semibold mt-1" style={{ background: sc.bg, color: sc.color }}>
          {project.status}
        </span>
        {(project.price || project.propertySize) && (
          <div className="flex gap-3 mt-0.5 text-xs">
            {project.price && <span className="font-semibold" style={{ color: "#078DD4" }}>₹ {project.price}</span>}
            {project.propertySize && <span className="text-slate-400">{project.propertySize}</span>}
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-slate-100 flex gap-2 justify-end">
        <Link href={`/projects/${project._id}`}>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:border-[#078DD4] hover:text-[#078DD4] transition-colors">
            <Pencil size={11} /> Edit
          </button>
        </Link>
        <button
          onClick={() => onDelete(project)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:border-red-300 hover:text-red-500 transition-colors"
        >
          <Trash2 size={11} /> Delete
        </button>
      </div>
    </div>
  );
}

function ProjectsPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const rawProjects = useSelector((s) => s.project.projects);
  const loading = useSelector((s) => s.project.loading);
  const total = useSelector((s) => s.project.total);
  const projects = Array.isArray(rawProjects) ? rawProjects : [];

  const [catFilter, setCatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { dispatch(fetchProjects({}, router)); }, [dispatch]);

  const filtered = projects.filter((p) => {
    const matchCat = catFilter === "all" || p.category === catFilter;
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || p.name?.toLowerCase().includes(q) || p.location?.toLowerCase().includes(q);
    return matchCat && matchStatus && matchSearch;
  });

  const stats = {
    total: projects.length,
    residential: projects.filter((p) => p.category === "residential").length,
    commercial: projects.filter((p) => p.category === "commercial").length,
    featured: projects.filter((p) => p.isFeatured).length,
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await dispatch(deleteProject(deleteTarget._id, router));
      setDeleteTarget(null);
    } catch { } finally { setDeleting(false); }
  };

  const TABS_CAT = [
    { id: "all", label: "All" },
    { id: "residential", label: "Residential" },
    { id: "commercial", label: "Commercial" },
  ];
  const TABS_STATUS = [
    { id: "all", label: "Any Status" },
    { id: "Under Construction", label: "Under Construction" },
    { id: "Ready to Move", label: "Ready to Move" },
  ];

  return (
    <>
      <Head><title>Projects | Lotusss Admin</title></Head>

      {deleteTarget && (
        <DeleteModal
          project={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}

      <div className="min-h-screen" style={{ background: "#f8fafc" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5 sm:space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Projects</h1>
              <p className="text-sm text-slate-400 mt-0.5">{total} project{total !== 1 ? "s" : ""} total</p>
            </div>
            <Link href="/projects/add" className="shrink-0">
              <button className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm" style={{ background: "#078DD4" }}>
                <Plus size={16} /> <span className="hidden sm:inline">Add Project</span><span className="sm:hidden">Add</span>
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total" value={stats.total} icon={LayoutGrid} color="#078DD4" />
            <StatCard label="Residential" value={stats.residential} icon={Building2} color="#0d1f35" />
            <StatCard label="Commercial" value={stats.commercial} icon={Building2} color="#078DD4" />
            <StatCard label="Featured" value={stats.featured} icon={Star} color="#0d1f35" />
          </div>

          {/* Filters */}
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-1 flex-wrap">
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 flex-wrap">
                {TABS_CAT.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setCatFilter(t.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${catFilter === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 flex-wrap">
                {TABS_STATUS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setStatusFilter(t.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${statusFilter === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects…"
              className="border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none text-slate-800 placeholder-slate-400 w-full sm:w-52 focus:border-[#078DD4] transition-colors"
            />
          </div>

          {/* Grid */}
          {loading ? (
            <div className="bg-white border border-slate-200 rounded-xl flex items-center justify-center py-24">
              <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "#078DD4", borderTopColor: "transparent" }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Building2 size={22} className="text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-600 mb-1">No projects found</p>
              <p className="text-xs text-slate-400 mb-5">
                {search ? "Try a different search." : "Click 'Add Project' to create your first one."}
              </p>
              {!search && (
                <Link href="/projects/add">
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ background: "#078DD4" }}>
                    <Plus size={14} /> Add Project
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((p) => (
                <ProjectCard key={p._id} project={p} onDelete={setDeleteTarget} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default isAuth(ProjectsPage);
