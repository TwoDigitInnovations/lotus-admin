import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import {
  Home,
  FolderOpen,
  Images,
  BookOpen,
  Mail,
  LogOut,
  X,
  LayoutDashboard,
  Info,
  FileText,
  Settings,
  LayoutGrid,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/redux/slices/userSlice";
import LogoutModal from "./LogoutModal";

const navItems = [
  { href: "/", icon: Home, title: "Dashboard" },
  { href: "/projects", icon: FolderOpen, title: "Projects" },
  { href: "/gallery", icon: Images, title: "Gallery" },
  { href: "/blogs", icon: BookOpen, title: "Blog" },
  { href: "/contacts", icon: Mail, title: "Contact Enquiries" },
];

const siteItems = [
  { href: "/site/banners", icon: LayoutDashboard, title: "Hero Banners" },
  { href: "/site/settings", icon: Settings, title: "Site Settings" },
  { href: "/site/about", icon: Info, title: "About Page" },
  { href: "/site/policy", icon: FileText, title: "Policy Pages" },
  { href: "/site/property-types", icon: LayoutGrid, title: "Property Types" },
];

function NavItem({ href, icon: Icon, title, active, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${
        active
          ? "bg-[#078DD4] text-white font-medium shadow-sm"
          : "text-gray-600 hover:bg-[#078DD4]/10 hover:text-[#078DD4]"
      }`}
    >
      <Icon size={16} className={active ? "text-white" : "text-gray-500"} />
      {title}
    </Link>
  );
}

function SidePannel({ open, setOpen }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { pathname } = router;
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const close = () => setOpen(false);

  const confirmLogout = () => {
    localStorage.removeItem("userDetail");
    localStorage.removeItem("token");
    dispatch(logoutUser());
    router.push("/login");
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={close}
        />
      )}

      {showLogoutModal && (
        <LogoutModal
          onConfirm={confirmLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}

      <aside
        className={`fixed left-0 w-54 bg-white border-r border-gray-100 z-40 flex flex-col
          transition-transform duration-300 overflow-hidden shadow-sm
          top-0 h-full md:top-12 md:h-[calc(100vh-48px)]
          ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Brand header */}
        <div className="px-3 pt-3 pb-2 flex items-center justify-between shrink-0 border-b border-gray-100">
          <div className="flex items-center">
            <img
              src="/images/logo.png"
              alt="Lotusss Logo"
              className="w-14 h-14 rounded-full object-cover shrink-0"
              // style={{ boxShadow: "0 2px 8px rgba(7,141,212,0.3)" }}
            />
            <div>
              <p className="text-[13px] font-semibold text-gray-900 leading-tight">
                Lotusss
              </p>
              <p className="text-[10px] text-gray-400">Admin Panel</p>
            </div>
          </div>
          <button
            className="md:hidden p-1.5 text-gray-400 hover:text-gray-700 transition-colors"
            onClick={close}
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5 no-scrollbar">
          <p className="px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
            Main Menu
          </p>
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              title={item.title}
              active={pathname === item.href}
              onClick={close}
            />
          ))}

          <p className="px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-4 mb-2">
            Site Content
          </p>
          {siteItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              title={item.title}
              active={pathname === item.href || pathname.startsWith(item.href)}
              onClick={close}
            />
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-2 pb-3 pt-2 border-t border-gray-100 space-y-0.5 shrink-0">
          {/* <NavItem
            href="/settings"
            icon={Settings}
            title="Settings"
            active={pathname === "/settings"}
            onClick={close}
          /> */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} className="text-red-400" />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}

export default SidePannel;
