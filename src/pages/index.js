import { useSelector } from "react-redux";
import {
  ShoppingBag,
  Users,
  Tag,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import isAuth from "@/components/isAuth";

const stats = [
  {
    label: "Total Orders",
    value: "—",
    change: null,
    icon: ShoppingBag,
    color: "#008060",
  },
  {
    label: "Total Customers",
    value: "—",
    change: null,
    icon: Users,
    color: "#3B82F6",
  },
  {
    label: "Total Products",
    value: "—",
    change: null,
    icon: Tag,
    color: "#8B5CF6",
  },
  {
    label: "Revenue",
    value: "—",
    change: null,
    icon: TrendingUp,
    color: "#F59E0B",
  },
];

const quickLinks = [
  { label: "View Orders", href: "/orders", color: "#008060" },
  { label: "Manage Products", href: "/products", color: "#3B82F6" },
  { label: "Customers", href: "/customers", color: "#8B5CF6" },
  { label: "Discounts", href: "/discounts", color: "#F59E0B" },
];

function Dashboard() {
  const { user } = useSelector((state) => state.user);
  const name = user?.fullname || user?.name || "Admin";

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Welcome back, {name.split(" ")[0]}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Here&apos;s what&apos;s happening in your store today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {s.label}
                </span>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: s.color + "18" }}
                >
                  <Icon size={16} style={{ color: s.color }} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400">Connect API to see data</p>
            </div>
          );
        })}
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all text-sm font-semibold text-gray-700 group"
            >
              {link.label}
              <ArrowUpRight
                size={14}
                className="text-gray-400 group-hover:text-gray-600 transition-colors"
              />
            </a>
          ))}
        </div>
      </div>

      {/* Placeholder activity */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Recent Activity
        </h2>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <ShoppingBag size={20} className="text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-600">No activity yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Activity will appear here once your store is connected.
          </p>
        </div>
      </div>
    </div>
  );
}

export default isAuth(Dashboard);
