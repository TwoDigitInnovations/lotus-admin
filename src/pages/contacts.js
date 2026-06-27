import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchContacts,
  changeContactStatus,
  deleteContact,
} from "@/redux/actions/contactActions";
import isAuth from "@/components/isAuth";
import Table from "@/components/table";
import {
  Phone,
  Trash2,
  Eye,
  X,
  MessageSquare,
  CheckCheck,
  InboxIcon,
  Clock,
} from "lucide-react";

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUSES = [
  { value: "", label: "All" },
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "replied", label: "Replied" },
];

const STATUS_CONFIG = {
  new: {
    label: "New",
    bg: "bg-[#e0f2fe]",
    text: "text-[#078DD4]",
    dot: "bg-[#078DD4]",
    icon: InboxIcon,
  },
  read: {
    label: "Read",
    bg: "bg-slate-100",
    text: "text-slate-500",
    dot: "bg-slate-400",
    icon: Clock,
  },
  replied: {
    label: "Replied",
    bg: "bg-[#e8eef5]",
    text: "text-[#0d1f35]",
    dot: "bg-[#0d1f35]",
    icon: CheckCheck,
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── Status Dropdown (inline cell) ─────────────────────────────────────────────

function StatusDropdown({ contact, onUpdate, disabled }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CONFIG[contact.status] || STATUS_CONFIG.new;

  const select = async (e, value) => {
    e.stopPropagation();
    setOpen(false);
    if (value === contact.status) return;
    await onUpdate(contact._id, value);
  };

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none
          ${cfg.bg} ${cfg.text} border-transparent hover:border-current disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {cfg.label}
        <svg
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setOpen(false); }} />
          <div className="absolute left-0 top-full mt-1 z-20 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden min-w-32.5">
            {STATUSES.filter((s) => s.value).map((s) => {
              const c = STATUS_CONFIG[s.value];
              return (
                <button
                  key={s.value}
                  onClick={(e) => select(e, s.value)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors hover:bg-slate-50
                    ${contact.status === s.value ? "font-semibold" : "text-slate-700"}`}
                >
                  <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                  {s.label}
                  {contact.status === s.value && (
                    <CheckCheck size={11} className="ml-auto text-slate-400" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────

function ContactModal({ contact, onClose, onStatusUpdate, onDelete, updating, deleting }) {
  if (!contact) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ background: "#0d1f35" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ background: "#078DD4" }}
            >
              {contact.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{contact.name}</p>
              <p className="text-white/50 text-xs">{formatDate(contact.createdAt)}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl px-4 py-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Phone</p>
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-slate-400" />
                <p className="text-sm font-medium text-slate-800">{contact.phone || "—"}</p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl px-4 py-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Status</p>
              <StatusDropdown contact={contact} onUpdate={onStatusUpdate} disabled={updating} />
            </div>
          </div>

          {contact.subject && (
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Subject</p>
              <p className="text-sm font-medium text-slate-800 bg-slate-50 rounded-xl px-4 py-3">{contact.subject}</p>
            </div>
          )}

          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Message</p>
            <div className="bg-slate-50 rounded-xl px-4 py-3 min-h-20">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {contact.message || <span className="text-slate-400 italic">No message</span>}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-5 flex items-center justify-between">
          <button
            onClick={() => onDelete(contact._id)}
            disabled={deleting}
            className="flex items-center gap-2 text-xs text-red-500 hover:text-red-700 font-semibold transition-colors disabled:opacity-50"
          >
            <Trash2 size={14} />
            {deleting ? "Deleting…" : "Delete enquiry"}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90"
            style={{ background: "#078DD4" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

function Contacts(props) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { contacts: rawContacts, loading, total } = useSelector((state) => state.contact);
  const contacts = Array.isArray(rawContacts) ? rawContacts : [];

  const [activeStatus, setActiveStatus] = useState("");
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = useCallback(
    (status = activeStatus) => {
      dispatch(fetchContacts({ page: 1, limit: 200, status }, router));
    },
    [dispatch, activeStatus, router],
  );

  useEffect(() => {
    load(activeStatus);
  }, [activeStatus]);

  const handleStatusChange = async (id, status) => {
    setUpdating(true);
    try {
      const res = await dispatch(changeContactStatus(id, status, router));
      if (res?.status) {
        props.toaster({ type: "success", message: "Status updated" });
        if (selected?._id === id) setSelected((p) => ({ ...p, status }));
      } else {
        props.toaster({ type: "error", message: res?.message || "Update failed" });
      }
    } catch {
      props.toaster({ type: "error", message: "Update failed" });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      const res = await dispatch(deleteContact(id, router));
      if (res?.status) {
        props.toaster({ type: "success", message: "Enquiry deleted" });
        setSelected(null);
        setDeleteConfirm(null);
      } else {
        props.toaster({ type: "error", message: res?.message || "Delete failed" });
      }
    } catch {
      props.toaster({ type: "error", message: "Delete failed" });
    } finally {
      setDeleting(false);
    }
  };

  // Column definitions for Table component
  const columns = useMemo(
    () => [
      {
        Header: "#",
        id: "index",
        Cell: ({ row }) => (
          <span className="text-slate-400 text-sm">{parseInt(row.id) + 1}</span>
        ),
        disableSortBy: true,
      },
      {
        Header: "Name",
        accessor: "name",
        Cell: ({ value }) => (
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: "#078DD4" }}
            >
              {value?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <span className="font-medium text-slate-800 max-w-30 truncate">{value}</span>
          </div>
        ),
      },
      {
        Header: "Phone",
        accessor: "phone",
        Cell: ({ value }) => (
          <div className="flex items-center gap-1.5 text-slate-600">
            <Phone size={12} className="text-slate-400 shrink-0" />
            {value}
          </div>
        ),
      },
      {
        Header: "Subject",
        accessor: "subject",
        Cell: ({ value }) => (
          <span className="text-slate-600 max-w-40 truncate block">
            {value || <span className="text-slate-300">—</span>}
          </span>
        ),
      },
      {
        Header: "Message",
        accessor: "message",
        Cell: ({ value }) => (
          <span className="text-slate-400 text-xs max-w-50 truncate block">
            {value ? value.slice(0, 55) + (value.length > 55 ? "…" : "") : (
              <span className="italic">No message</span>
            )}
          </span>
        ),
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ row }) => (
          <StatusDropdown
            contact={row.original}
            onUpdate={handleStatusChange}
            disabled={updating}
          />
        ),
        disableSortBy: true,
      },
      {
        Header: "Date",
        accessor: "createdAt",
        Cell: ({ value }) => (
          <span className="text-xs text-slate-400 whitespace-nowrap">{formatDate(value)}</span>
        ),
      },
      {
        Header: "",
        id: "actions",
        Cell: ({ row }) => (
          <div
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(row.original)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#078DD4] hover:bg-blue-50 transition-colors"
              title="View"
            >
              <Eye size={15} />
            </button>
            <button
              onClick={() => setDeleteConfirm(row.original._id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Delete"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ),
        disableSortBy: true,
      },
    ],
    [updating],
  );

  // Stat counts
  const counts = contacts.reduce(
    (acc, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; },
    { new: 0, read: 0, replied: 0 },
  );

  return (
    <>
      {/* Detail modal */}
      {selected && (
        <ContactModal
          contact={selected}
          onClose={() => setSelected(null)}
          onStatusUpdate={handleStatusChange}
          onDelete={(id) => setDeleteConfirm(id)}
          updating={updating}
          deleting={deleting}
        />
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Delete Enquiry?</h3>
            <p className="text-sm text-slate-400 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Contact Enquiries</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {total} total enquir{total === 1 ? "y" : "ies"}
            </p>
          </div>
          <button
            onClick={() => load(activeStatus)}
            className="text-xs font-semibold px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { key: "new", ...STATUS_CONFIG.new },
            { key: "read", ...STATUS_CONFIG.read },
            { key: "replied", ...STATUS_CONFIG.replied },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.key}
                onClick={() => setActiveStatus(s.key === activeStatus ? "" : s.key)}
                className={`bg-white rounded-2xl border p-3 sm:p-4 text-left transition-all hover:shadow-sm ${
                  activeStatus === s.key ? "border-[#078DD4] shadow-sm" : "border-slate-100"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    {s.label}
                  </span>
                  <div className={`p-1 sm:p-1.5 rounded-lg ${s.bg}`}>
                    <Icon size={12} className={s.text} />
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{counts[s.key] ?? 0}</p>
              </button>
            );
          })}
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 w-fit overflow-x-auto">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setActiveStatus(s.value)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeStatus === s.value
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-100 flex items-center justify-center py-20">
            <div
              className="w-8 h-8 rounded-full border-2 animate-spin"
              style={{ borderColor: "#078DD4", borderTopColor: "transparent" }}
            />
          </div>
        ) : contacts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <MessageSquare size={22} className="text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-600">No enquiries found</p>
            <p className="text-xs text-slate-400 mt-1">
              {activeStatus ? `No ${activeStatus} enquiries at the moment.` : "No contact enquiries yet."}
            </p>
          </div>
        ) : (
          <Table
            columns={columns}
            data={contacts}
            pageSize={15}
            onRowClick={(row) => setSelected(row)}
            emptyComponent={
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare size={20} className="text-slate-300 mb-2" />
                <p className="text-sm text-slate-400">No results match your search.</p>
              </div>
            }
          />
        )}
      </div>
    </>
  );
}

export default isAuth(Contacts);
